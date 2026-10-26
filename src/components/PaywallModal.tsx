import React, { useState } from 'react';
import { PURCHASE_PACKAGES, PREMIUM_PERKS } from '../services/purchaseService';
import { X, ArrowRight } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  themeCardBg: string;
  themeCardBorder: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  themeCardBg,
  themeCardBorder,
  themeTextPrimary,
  themeTextSecondary,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUnlockSuccess();
      onClose();
    }, 600);
  };

  const handleRestore = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUnlockSuccess();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full max-w-md max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden border ${themeCardBg} ${themeCardBorder}`}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.05]">
          <span className={`text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500`}>
            MoodNote Supporter
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-400"
            aria-label="Close paywall"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="text-center space-y-1">
            <h2 className={`text-xl font-serif font-semibold ${themeTextPrimary}`}>
              Support Mindful Journaling
            </h2>
            <p className={`text-xs ${themeTextSecondary}`}>
              A private, offline-first tool funded directly by writers like you.
            </p>
          </div>

          {/* Unboxed Perks list */}
          <div className="space-y-2 pt-1 text-xs">
            {PREMIUM_PERKS.map((perk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-stone-600 dark:text-zinc-300">
                <span className="text-amber-700 dark:text-amber-500 mt-0.5">•</span>
                <div>
                  <span className={`font-medium ${themeTextPrimary}`}>{perk.title}</span>
                  <span className="text-stone-400 dark:text-zinc-500 ml-1.5">— {perk.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Clean Plan Selection */}
          <div className="space-y-2 pt-2">
            {PURCHASE_PACKAGES.map((pkg) => {
              const isSelected = selectedPlan === pkg.id;
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPlan(pkg.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-amber-700 dark:border-amber-500 bg-amber-500/[0.04]'
                      : 'border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.02]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-medium ${themeTextPrimary}`}>{pkg.title}</span>
                      {pkg.badge && (
                        <span className="text-[9px] font-semibold text-amber-700 dark:text-amber-400">
                          ({pkg.badge})
                        </span>
                      )}
                    </div>
                    <div className={`text-[11px] ${themeTextSecondary}`}>{pkg.periodText}</div>
                  </div>
                  <span className={`text-xs font-semibold ${themeTextPrimary}`}>{pkg.priceDisplay}</span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-center text-stone-400">
            Cancel anytime in App Store or Google Play settings.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.05] space-y-2">
          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing}
            className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>{isProcessing ? 'Connecting...' : 'Continue'}</span>
            {!isProcessing && <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400">
            <button type="button" onClick={handleRestore} className="hover:underline cursor-pointer">
              Restore Purchases
            </button>
            <span aria-hidden="true">·</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span aria-hidden="true">·</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
