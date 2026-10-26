import React, { useState } from 'react';
import { Shield, Sparkles, Bell, ArrowRight, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (reminderTime: string) => void;
  themeCardBg: string;
  themeCardBorder: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  themeCardBg,
  themeCardBorder,
  themeTextPrimary,
  themeTextSecondary,
}) => {
  const [step, setStep] = useState<number>(1);
  const [reminderTime, setReminderTime] = useState<string>('21:00');

  if (!isOpen) return null;

  const screens = [
    {
      step: 1,
      icon: <Shield className="w-10 h-10 text-emerald-600" />,
      tag: 'PRIVACY FIRST',
      title: 'Your Thoughts Stay On Your Device',
      description:
        'No accounts, no email required, no cloud tracking. MoodNote is completely offline-first. Your private journal reflections belong solely to you.',
    },
    {
      step: 2,
      icon: <Sparkles className="w-10 h-10 text-amber-500" />,
      tag: 'NOTICE THE PATTERNS',
      title: 'Track Your Mood & Energy Daily',
      description:
        'Log your emotional climate with 5 serene mood levels, track physical energy, and tag everyday activities to uncover what brings you genuine joy.',
    },
    {
      step: 3,
      icon: <Bell className="w-10 h-10 text-amber-600" />,
      tag: 'BUILD A GENTLE HABIT',
      title: 'When Would You Like a Gentle Nudge?',
      description:
        'A quiet evening reflection helps quiet the mind before sleep. Choose a daily reminder time:',
    },
  ];

  const current = screens[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete(reminderTime);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl p-6 sm:p-8 flex flex-col shadow-2xl border ${themeCardBg} ${themeCardBorder}`}
      >
        {/* Step Indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-amber-600' : 'w-2 bg-stone-300 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Visual Icon */}
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5 shadow-xs">
          {current.icon}
        </div>

        {/* Content */}
        <div className="text-center space-y-2 mb-6">
          <span className="text-[10px] font-extrabold tracking-widest text-amber-600 uppercase">
            {current.tag}
          </span>
          <h2 className={`text-xl sm:text-2xl font-serif font-bold ${themeTextPrimary}`}>
            {current.title}
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${themeTextSecondary}`}>
            {current.description}
          </p>

          {/* Time Picker on Step 3 */}
          {step === 3 && (
            <div className="pt-4 flex items-center justify-center gap-3">
              <label htmlFor="onboarding-reminder-time" className={`text-xs font-semibold ${themeTextSecondary}`}>
                Reminder:
              </label>
              <input
                id="onboarding-reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className={`text-sm font-mono px-4 py-2 rounded-xl border border-stone-300 dark:border-zinc-700 bg-black/5 dark:bg-white/5 ${themeTextPrimary} font-bold focus:outline-hidden focus:ring-2 focus:ring-amber-500`}
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{step === 3 ? 'Begin Your Journey' : 'Continue'}</span>
          {step === 3 ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
