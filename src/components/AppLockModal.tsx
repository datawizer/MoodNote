import React, { useState } from 'react';
import { Lock, Fingerprint, Delete, Shield } from 'lucide-react';

interface AppLockModalProps {
  isLocked: boolean;
  onUnlock: () => void;
  savedPin: string;
  themeCardBg: string;
  themeCardBorder: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
}

export const AppLockModal: React.FC<AppLockModalProps> = ({
  isLocked,
  onUnlock,
  savedPin,
  themeCardBg,
  themeCardBorder,
  themeTextPrimary,
  themeTextSecondary,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  if (!isLocked) return null;

  const handleKeyClick = (digit: string) => {
    if (pinInput.length >= 4) return;
    const nextPin = pinInput + digit;
    setPinInput(nextPin);

    if (nextPin.length === 4) {
      // Validate
      const targetPin = savedPin || '1234'; // Default PIN if user enabled lock without custom PIN
      if (nextPin === targetPin) {
        setIsError(false);
        onUnlock();
      } else {
        setIsError(true);
        setTimeout(() => {
          setPinInput('');
          setIsError(false);
        }, 600);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleBiometricAuth = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      onUnlock();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl border ${themeCardBg} ${themeCardBorder}`}
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>

        <h2 className={`text-xl font-serif font-bold ${themeTextPrimary}`}>
          MoodNote Locked
        </h2>
        <p className={`text-xs mt-1 mb-6 ${themeTextSecondary}`}>
          Enter your 4-digit PIN or use Biometric ID to access your reflections.
        </p>

        {/* 4 PIN Dots */}
        <div className={`flex items-center gap-4 mb-8 ${isError ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? isError
                      ? 'bg-red-500 scale-110'
                      : 'bg-amber-600 scale-110'
                    : 'border-2 border-stone-300 dark:border-zinc-600 bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyClick(digit)}
              className="w-14 h-14 rounded-full border border-stone-200 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-lg font-semibold flex items-center justify-center cursor-pointer mx-auto"
            >
              <span className={themeTextPrimary}>{digit}</span>
            </button>
          ))}

          {/* Biometrics button */}
          <button
            type="button"
            onClick={handleBiometricAuth}
            disabled={isBiometricScanning}
            className="w-14 h-14 rounded-full border border-stone-200 dark:border-zinc-700 hover:bg-amber-500/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer text-amber-600 mx-auto"
            aria-label="Unlock with biometrics"
          >
            <Fingerprint className={`w-6 h-6 ${isBiometricScanning ? 'animate-pulse' : ''}`} />
          </button>

          {/* Zero digit */}
          <button
            type="button"
            onClick={() => handleKeyClick('0')}
            className="w-14 h-14 rounded-full border border-stone-200 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all text-lg font-semibold flex items-center justify-center cursor-pointer mx-auto"
          >
            <span className={themeTextPrimary}>0</span>
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            className="w-14 h-14 rounded-full border border-stone-200 dark:border-zinc-700 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center justify-center cursor-pointer text-stone-400 mx-auto"
            aria-label="Delete last digit"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleBiometricAuth}
          className="text-xs text-amber-600 hover:underline mt-2 cursor-pointer font-medium"
        >
          {isBiometricScanning ? 'Authenticating with Face ID...' : 'Touch sensor or scan Face ID (Default PIN: 1234)'}
        </button>
      </div>
    </div>
  );
};
