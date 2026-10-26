import React from 'react';
import { Flame, Lock } from 'lucide-react';

interface HeaderProps {
  currentStreak: number;
  isLockedEnabled: boolean;
  onLockApp: () => void;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentStreak,
  isLockedEnabled,
  onLockApp,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  return (
    <header className="w-full px-5 pt-5 pb-3 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-600 inline-block animate-pulse" />
        <h1 className={`text-lg font-serif font-semibold tracking-tight ${textPrimaryClass}`}>
          MoodNote
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quiet streak counter */}
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${textSecondaryClass}`}
          title={`${currentStreak} day streak`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500/80" />
          <span>{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</span>
        </div>

        {/* Lock App Button (if enabled) */}
        {isLockedEnabled && (
          <button
            type="button"
            onClick={onLockApp}
            className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${textSecondaryClass}`}
            aria-label="Lock app"
            title="Lock app"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
