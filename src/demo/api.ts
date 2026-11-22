/**
 * DEMO SERVICE LAYER — every function here is SIMULATED.
 *
 * No network requests are made. Calls resolve after a short artificial delay
 * so loading states can be seen. Swap this module for real API clients when
 * integrating a backend; the rest of the app only depends on these signatures.
 */

export const IS_DEMO = true;

const wait = (ms = 700) => new Promise((r) => setTimeout(r, ms));

export interface DemoUser {
  name: string;
  phone: string;
  email: string;
}

export interface OrderLine {
  slug: string;
  name: string;
  price: number;
  qty: number;
  playerId?: string;
  options?: string[];
}

export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  total: number;
  status: 'completed';
}

/** Simulated: would send an OTP to the phone number. */
export async function requestLoginOtp(phone: string) {
  await wait();
  return { ok: true as const, phone };
}

/** Simulated: any 6-digit code is accepted. */
export async function verifyOtp(code: string) {
  await wait(600);
  return { ok: /^\d{6}$/.test(code) };
}

/** Simulated: would create the account and send a verification code. */
export async function register(user: DemoUser & { password: string }) {
  await wait(900);
  const { password: _ignored, ...publicUser } = user;
  return { ok: true as const, user: publicUser };
}

/** Simulated: would send a recovery message. */
export async function requestRecovery(phone: string) {
  await wait();
  return { ok: true as const, phone };
}

/** Simulated: would store the new password. */
export async function resetPassword(_password: string) {
  await wait(800);
  return { ok: true as const };
}

/** Simulated: social sign-in returns a placeholder profile. */
export async function socialSignIn(provider: 'google' | 'apple') {
  await wait(800);
  return { ok: true as const, user: { name: provider === 'google' ? 'مستخدم Google' : 'مستخدم Apple', phone: '', email: '' } };
}

/** Simulated: would persist the profile server-side. */
export async function saveProfile<T>(profile: T) {
  await wait(600);
  return { ok: true as const, profile };
}

/** Simulated: no payment is taken. Returns a completed demo order. */
export async function placeOrder(lines: OrderLine[]): Promise<Order> {
  await wait(1100);
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  return {
    id: `KN-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    lines,
    total,
    status: 'completed',
  };
}

/** Simulated: would deliver the contact message. */
export async function sendContactMessage(_msg: { name: string; phone: string; message: string }) {
  await wait(800);
  return { ok: true as const };
}
