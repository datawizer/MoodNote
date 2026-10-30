/**
 * Supporter plans. No store SDK is connected yet: purchases are simulated so the
 * premium flow can be exercised end to end. Wire RevenueCat (react-native-purchases)
 * into `purchase` and `restore` before a store release; see PUBLISHING_GUIDE.md.
 */
export const STORE_CONNECTED = false;

export type PlanId = 'yearly' | 'monthly' | 'lifetime';

export interface Plan {
  id: PlanId;
  title: string;
  price: string;
  detail: string;
  badge?: string;
}

export const PLANS: Plan[] = [
  { id: 'yearly', title: 'Yearly', price: '$19.99 / year', detail: '$1.66 a month · 7-day free trial', badge: 'Save 45%' },
  { id: 'monthly', title: 'Monthly', price: '$2.99 / month', detail: 'Cancel anytime' },
  { id: 'lifetime', title: 'Lifetime', price: '$39.99 once', detail: 'Pay once, keep forever' },
];

export const PREMIUM_PERKS: { icon: 'feather' | 'droplet' | 'file-text' | 'bar-chart-2'; title: string; desc: string }[] = [
  { icon: 'droplet', title: 'Four extra themes', desc: 'Midnight Velvet, Pine & Moss, Warm Terracotta and Vintage Parchment.' },
  { icon: 'file-text', title: 'PDF and JSON export', desc: 'A print-ready journal book and a full portable backup.' },
  { icon: 'bar-chart-2', title: 'Weekday patterns', desc: 'See which days and activities lift your mood.' },
  { icon: 'feather', title: 'Support independent software', desc: 'No accounts, no tracking, no ads. Ever.' },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function purchase(_plan: PlanId): Promise<boolean> {
  await wait(700);
  return true;
}

export async function restore(): Promise<boolean> {
  await wait(500);
  return true;
}
