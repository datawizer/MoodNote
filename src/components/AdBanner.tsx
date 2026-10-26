import React from 'react';
import { TEST_AD_CONFIG } from '../services/adService';

interface AdBannerProps {
  isPremium: boolean;
  onOpenPaywall: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ isPremium, onOpenPaywall }) => {
  if (isPremium) return null;

  return (
    <div className="w-full my-4 py-2 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between text-xs text-stone-400 dark:text-zinc-500">
      <div className="flex items-center gap-2 truncate">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.05]">
          Ad
        </span>
        <span className="truncate text-[11px]">
          AdMob Preview · {TEST_AD_CONFIG.iosBannerId.slice(-10)}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpenPaywall}
        className="text-[11px] font-medium text-amber-700 dark:text-amber-500 hover:underline cursor-pointer shrink-0 ml-2"
        aria-label="Remove ads with Premium"
      >
        Remove ads
      </button>
    </div>
  );
};
