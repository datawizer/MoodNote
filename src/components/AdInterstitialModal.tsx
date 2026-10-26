import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { TEST_AD_CONFIG } from '../services/adService';

interface AdInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaywall: () => void;
}

export const AdInterstitialModal: React.FC<AdInterstitialModalProps> = ({
  isOpen,
  onClose,
  onOpenPaywall,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-700 text-white p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Top Ad Label & Close Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-sm bg-yellow-500/20 text-yellow-400 font-mono text-[10px] font-bold">
              ADMOB INTERSTITIAL
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Test Mode</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={countdown > 0}
            className={`p-1.5 rounded-full border transition-all ${
              countdown > 0
                ? 'border-zinc-700 text-zinc-500 cursor-not-allowed text-xs px-2.5'
                : 'border-zinc-500 text-white hover:bg-zinc-800 cursor-pointer'
            }`}
          >
            {countdown > 0 ? `Skip in ${countdown}s` : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Ad Mock Content */}
        <div className="py-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 mx-auto flex items-center justify-center shadow-lg text-2xl font-bold">
            ☕
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">Artisan Coffee Co.</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Single-origin beans freshly roasted to order. Use code MOODNOTE for 20% off.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
          >
            Visit Sponsor Website
          </button>
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
          <span className="font-mono truncate">{TEST_AD_CONFIG.iosInterstitialId}</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPaywall();
            }}
            className="text-amber-400 hover:underline cursor-pointer font-medium ml-2 shrink-0"
          >
            Upgrade to Remove Ads
          </button>
        </div>
      </div>
    </div>
  );
};
