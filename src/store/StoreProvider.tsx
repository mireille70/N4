import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import type { DemoUser, Order, OrderLine } from '@/demo/api';

export interface CartLine extends OrderLine {
  key: string;
  image?: string;
}

export interface Profile {
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  birthday: string;
  country: string;
  gender: string;
  avatar: number;
}

export type AuthFlow = 'login' | 'register' | 'reset';

interface State {
  cart: CartLine[];
  favorites: string[];
  user: DemoUser | null;
  profile: Profile;
  orders: Order[];
  pending: { flow: AuthFlow; phone: string; user?: DemoUser } | null;
}

export interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

const emptyProfile: Profile = { name: '', phone: '', countryCode: 'SA', email: '', birthday: '', country: '', gender: '', avatar: 0 };
const initial: State = { cart: [], favorites: [], user: null, profile: emptyProfile, orders: [], pending: null };
const STORAGE_KEY = 'koon-theme-demo-v1';

type Action =
  | { type: 'cart/add'; line: CartLine }
  | { type: 'cart/qty'; key: string; qty: number }
  | { type: 'cart/remove'; key: string }
  | { type: 'cart/clear' }
  | { type: 'fav/toggle'; slug: string }
  | { type: 'auth/pending'; pending: State['pending'] }
  | { type: 'auth/login'; user: DemoUser }
  | { type: 'auth/logout' }
  | { type: 'profile/save'; profile: Profile }
  | { type: 'orders/add'; order: Order }
  | { type: 'account/delete' };

function reducer(state: State, a: Action): State {
  switch (a.type) {
    case 'cart/add': {
      const existing = state.cart.find((l) => l.key === a.line.key);
      if (existing) return { ...state, cart: state.cart.map((l) => (l.key === a.line.key ? { ...l, qty: Math.min(l.qty + a.line.qty, 10) } : l)) };
      return { ...state, cart: [...state.cart, a.line] };
    }
    case 'cart/qty':
      return { ...state, cart: state.cart.map((l) => (l.key === a.key ? { ...l, qty: Math.max(1, Math.min(10, a.qty)) } : l)) };
    case 'cart/remove':
      return { ...state, cart: state.cart.filter((l) => l.key !== a.key) };
    case 'cart/clear':
      return { ...state, cart: [] };
    case 'fav/toggle':
      return { ...state, favorites: state.favorites.includes(a.slug) ? state.favorites.filter((s) => s !== a.slug) : [...state.favorites, a.slug] };
    case 'auth/pending':
      return { ...state, pending: a.pending };
    case 'auth/login':
      return {
        ...state,
        user: a.user,
        pending: null,
        profile: { ...state.profile, name: state.profile.name || a.user.name, phone: state.profile.phone || a.user.phone, email: state.profile.email || a.user.email },
      };
    case 'auth/logout':
      return { ...state, user: null };
    case 'profile/save':
      return { ...state, profile: a.profile, user: state.user ? { ...state.user, name: a.profile.name, phone: a.profile.phone, email: a.profile.email } : state.user };
    case 'orders/add':
      return { ...state, orders: [a.order, ...state.orders] };
    case 'account/delete':
      return initial;
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

interface Store extends State {
  dispatch: React.Dispatch<Action>;
  cartCount: number;
  cartTotal: number;
  loyaltyPoints: number;
  isFavorite: (slug: string) => boolean;
  toasts: Toast[];
  notify: (message: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [toasts, setToasts] = useReducer((_: Toast[], next: Toast[]) => next, []);
  const toastsRef = useRef<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — the demo still works in memory */
    }
  }, [state]);

  const dismiss = useCallback((id: number) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
    setToasts(toastsRef.current);
  }, []);

  const notify = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    toastsRef.current = [...toastsRef.current.slice(-2), { id, message, tone }];
    setToasts(toastsRef.current);
    setTimeout(() => dismiss(id), 3600);
  }, [dismiss]);

  const value = useMemo<Store>(() => {
    const spent = state.orders.reduce((s, o) => s + o.total, 0);
    return {
      ...state,
      dispatch,
      cartCount: state.cart.reduce((s, l) => s + l.qty, 0),
      cartTotal: state.cart.reduce((s, l) => s + l.qty * l.price, 0),
      loyaltyPoints: Math.floor(spent),
      isFavorite: (slug) => state.favorites.includes(slug),
      toasts,
      notify,
      dismiss,
    };
  }, [state, toasts, notify, dismiss]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
