/**
 * PurchaseService - RevenueCat / StoreKit / Google Play Billing
 * Manages tiers: Monthly ($2.99), Annual ($19.99, save 45%), Lifetime ($39.99)
 */

export interface SubscriptionPackage {
  id: 'monthly' | 'yearly' | 'lifetime';
  title: string;
  priceDisplay: string;
  pricePerMonth?: string;
  badge?: string;
  periodText: string;
  description: string;
}

export const PURCHASE_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'yearly',
    title: 'Yearly Supporter',
    priceDisplay: '$19.99/yr',
    pricePerMonth: '$1.66/mo',
    badge: 'BEST VALUE • SAVE 45%',
    periodText: 'Billed annually with 7-day free trial',
    description: 'Full unlimited access across all devices',
  },
  {
    id: 'monthly',
    title: 'Monthly Plan',
    priceDisplay: '$2.99/mo',
    periodText: 'Billed monthly, cancel anytime',
    description: 'Flexible month-to-month subscription',
  },
  {
    id: 'lifetime',
    title: 'Lifetime Unlock',
    priceDisplay: '$39.99',
    badge: 'ONE-TIME',
    periodText: 'Pay once, keep forever',
    description: 'No recurring fees. Support independent software.',
  },
];

export const PREMIUM_PERKS = [
  {
    title: 'Ad-Free Calm Experience',
    desc: 'Pure focus with zero banners, interstitials, or promotional interruptions.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Exclusive Serene Themes',
    desc: 'Midnight Velvet, Pine & Moss, Warm Terracotta, and Vintage Parchment.',
    icon: 'Sparkles',
  },
  {
    title: 'Complete Export to PDF & JSON',
    desc: 'Print-ready journal booklets, plain text, and complete portable JSON archives.',
    icon: 'FileDown',
  },
  {
    title: 'Full Backup & Restore',
    desc: 'Save encrypted backups directly to iCloud, Google Drive, or Local Files.',
    icon: 'HardDrive',
  },
  {
    title: 'Advanced Analytics & Insights',
    desc: 'Weekday mood trends, tag-to-mood correlations, and long-term pattern reflections.',
    icon: 'TrendingUp',
  },
  {
    title: 'Unlimited Tags & Activities',
    desc: 'Tag freely without constraints to capture the subtle nuances of your days.',
    icon: 'Tag',
  },
];
