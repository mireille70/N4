import { useSyncExternalStore } from 'react';
import { DEMO_NOTIFS, type Notif } from '@/content/notifications';

/**
 * Tiny shared store for the demo notification feed, so the header bell and the
 * /notifications page stay in sync. Read/deleted ids persist in this browser.
 */
const KEY = 'koon.notifs';
type Persist = { read: string[]; removed: string[] };

function load(): Persist {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Persist;
  } catch { /* ignore */ }
  return { read: ['n5', 'n6', 'n7'], removed: [] };
}

let state = load();
let snapshot = build();
const listeners = new Set<() => void>();

function build() {
  const items = DEMO_NOTIFS.filter((n) => !state.removed.includes(n.id)).map((n) => ({ ...n, read: state.read.includes(n.id) }));
  return { items, unread: items.filter((n) => !n.read).length };
}
function commit(next: Persist) {
  state = next;
  snapshot = build();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export type NotifItem = Notif & { read: boolean };

export const notifActions = {
  markRead: (id: string) => { if (!state.read.includes(id)) commit({ ...state, read: [...state.read, id] }); },
  markAllRead: () => commit({ ...state, read: DEMO_NOTIFS.map((n) => n.id) }),
  remove: (id: string) => commit({ ...state, removed: [...state.removed, id] }),
  restoreDemo: () => commit({ read: [], removed: [] }),
};

export function useNotifications() {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => snapshot,
    () => snapshot,
  );
}
