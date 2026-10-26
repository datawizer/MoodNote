import React, { useState, useRef } from 'react';
import { Entry, Settings, Tag, ThemeId } from '../types/journal';
import { THEMES } from '../constants/themes';
import { ExportService } from '../services/exportService';
import { storage } from '../db/storage';
import {
  Bell,
  Palette,
  Lock,
  HardDrive,
  Sparkles,
  Database,
  Check,
  FileText,
  Code2,
} from 'lucide-react';

interface SettingsViewProps {
  settings: Settings;
  onUpdateSettings: (partial: Partial<Settings>) => void;
  entries: Entry[];
  tags: Tag[];
  onReloadData: () => void;
  onOpenPaywall: () => void;
  onOpenExpoInspector: () => void;
  cardBgClass: string;
  cardBorderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  entries,
  tags,
  onReloadData,
  onOpenPaywall,
  onOpenExpoInspector,
  cardBgClass,
  cardBorderClass,
  textPrimaryClass,
  textSecondaryClass,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState(settings.pinCode || '1234');
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleThemeChange = (themeId: ThemeId) => {
    const themeConfig = THEMES[themeId];
    if (themeConfig.isPremium && !settings.isPremium) {
      onOpenPaywall();
      return;
    }
    onUpdateSettings({ theme: themeId });
  };

  const handleTestNotification = () => {
    setNotificationStatus('Gentle reminder simulated: "How are you feeling this evening? Take a quiet moment for MoodNote."');
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  const handleSeedData = () => {
    if (window.confirm('Load 30 days of sample journal reflections? This will give you realistic streaks, charts, and calendar colors.')) {
      storage.generate30DaySeed();
      onReloadData();
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all entries? Please export a backup first if you wish to keep them.')) {
      storage.clearAllData();
      onReloadData();
    }
  };

  const handleExportJson = () => {
    if (!settings.isPremium) {
      onOpenPaywall();
      return;
    }
    const jsonStr = storage.exportBackupJson();
    ExportService.downloadJson(jsonStr);
  };

  const handleExportTxt = () => {
    ExportService.downloadTxt(entries, tags);
  };

  const handleExportPdf = () => {
    if (!settings.isPremium) {
      onOpenPaywall();
      return;
    }
    ExportService.printOrSavePdf(entries, tags);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importBackupJson(content);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} reflections!`);
        onReloadData();
      } else {
        setImportStatus(`Restore error: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Supporter Badge Card */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
          settings.isPremium
            ? 'bg-amber-500/[0.04] border-amber-600/30'
            : `${cardBgClass} ${cardBorderClass}`
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{settings.isPremium ? 'Supporter Edition Active' : 'MoodNote Free'}</span>
            </div>
            <p className={`text-xs ${textSecondaryClass}`}>
              {settings.isPremium
                ? 'All 6 serene themes, unlimited exports, and zero ads.'
                : 'Unlock themes, PDF export, and support mindful development.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenPaywall}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              settings.isPremium
                ? 'bg-amber-600/10 text-amber-700 dark:text-amber-400 hover:bg-amber-600/20'
                : 'bg-amber-700 hover:bg-amber-800 text-white shadow-xs'
            }`}
          >
            {settings.isPremium ? 'Manage' : 'Upgrade'}
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
          <Palette className="w-3.5 h-3.5" />
          <span>Themes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
            const config = THEMES[tId];
            const isSelected = settings.theme === tId;

            return (
              <button
                key={tId}
                type="button"
                onClick={() => handleThemeChange(tId)}
                className={`p-2.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-amber-700 dark:border-amber-500 bg-amber-500/[0.04]'
                    : 'border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.02]'
                }`}
              >
                {config.isPremium && !settings.isPremium && (
                  <span className="absolute top-2 right-2 text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    PRO
                  </span>
                )}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-amber-700 dark:text-amber-500">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 ${config.bg}`} />
                  <span className={`w-3.5 h-3.5 rounded-full ${config.accent}`} />
                </div>
                <div className={`text-xs font-medium ${textPrimaryClass}`}>{config.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Reminders */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-stone-400" />
            <div>
              <h3 className={`text-xs font-medium ${textPrimaryClass}`}>Daily Reminder</h3>
              <p className={`text-[11px] ${textSecondaryClass}`}>Gentle evening reflection nudge</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => onUpdateSettings({ reminderEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-700"></div>
          </label>
        </div>

        {settings.reminderEnabled && (
          <div className="space-y-2 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center justify-between text-xs">
              <span className={textSecondaryClass}>Reminder time:</span>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => onUpdateSettings({ reminderTime: e.target.value })}
                className={`text-xs px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-transparent font-mono ${textPrimaryClass} focus:outline-hidden`}
              />
            </div>
            <button
              type="button"
              onClick={handleTestNotification}
              className="w-full py-1.5 rounded-lg text-[11px] font-medium text-amber-700 dark:text-amber-500 hover:underline cursor-pointer text-left"
            >
              Test notification preview →
            </button>
            {notificationStatus && (
              <p className="text-xs p-2 rounded-lg bg-amber-500/[0.08] text-amber-800 dark:text-amber-200 text-center animate-fade-in">
                {notificationStatus}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Security & App Lock */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-400" />
            <div>
              <h3 className={`text-xs font-medium ${textPrimaryClass}`}>Biometric & PIN Lock</h3>
              <p className={`text-[11px] ${textSecondaryClass}`}>Require Face ID or PIN to open</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.biometricsEnabled}
              onChange={(e) => {
                const val = e.target.checked;
                onUpdateSettings({ biometricsEnabled: val, isLocked: val });
              }}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-stone-300 dark:bg-zinc-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-700"></div>
          </label>
        </div>

        {settings.biometricsEnabled && (
          <div className="space-y-2 pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
            <div className="flex items-center justify-between text-xs">
              <span className={textSecondaryClass}>Current PIN:</span>
              <span className="font-mono font-medium text-amber-700 dark:text-amber-400">{settings.pinCode || '1234'}</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPinDialog(!showPinDialog)}
              className="text-xs text-amber-700 dark:text-amber-500 hover:underline cursor-pointer"
            >
              Change 4-Digit PIN →
            </button>
            {showPinDialog && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="4 digits"
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-transparent ${textPrimaryClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pinInput.length === 4) {
                      onUpdateSettings({ pinCode: pinInput });
                      setShowPinDialog(false);
                    } else {
                      alert('PIN must be 4 digits.');
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-700 text-white text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export & Backup */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Export & Backup</span>
        </div>

        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05] text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className={`font-medium ${textPrimaryClass}`}>Text / Markdown Archive</div>
              <div className={`text-[11px] ${textSecondaryClass}`}>Plain text file format</div>
            </div>
            <button
              type="button"
              onClick={handleExportTxt}
              className="text-xs text-amber-700 dark:text-amber-500 hover:underline cursor-pointer font-medium"
            >
              Download
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className={`font-medium ${textPrimaryClass}`}>Print-Ready PDF Booklet</div>
              <div className={`text-[11px] ${textSecondaryClass}`}>Formatted journal book</div>
            </div>
            <button
              type="button"
              onClick={handleExportPdf}
              className="text-xs text-amber-700 dark:text-amber-500 hover:underline cursor-pointer font-medium"
            >
              Generate PDF
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className={`font-medium ${textPrimaryClass}`}>JSON Backup File</div>
              <div className={`text-[11px] ${textSecondaryClass}`}>Complete portable snapshot</div>
            </div>
            <button
              type="button"
              onClick={handleExportJson}
              className="text-xs text-amber-700 dark:text-amber-500 hover:underline cursor-pointer font-medium"
            >
              Export JSON
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className={`font-medium ${textPrimaryClass}`}>Restore from Backup</div>
              <div className={`text-[11px] ${textSecondaryClass}`}>Import previously saved .json</div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-amber-700 dark:text-amber-500 hover:underline cursor-pointer font-medium"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {importStatus && (
          <p className="text-xs p-2 mt-2 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-center animate-fade-in">
            {importStatus}
          </p>
        )}
      </div>

      {/* Developer & Architecture Tools */}
      <div className={`rounded-2xl p-5 border transition-all ${cardBgClass} ${cardBorderClass}`}>
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-zinc-500">
          <Code2 className="w-3.5 h-3.5" />
          <span>Expo Architecture & Sample Data</span>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <button
            type="button"
            onClick={onOpenExpoInspector}
            className="w-full text-left py-2 px-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] transition-colors flex items-center justify-between cursor-pointer"
          >
            <span className={textPrimaryClass}>Inspect React Native Expo Source & Schema</span>
            <span className="text-stone-400">→</span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSeedData}
              className="flex-1 py-1.5 px-3 rounded-lg border border-stone-200 dark:border-zinc-800 text-[11px] font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 cursor-pointer"
            >
              Seed 30-Day Sample Data
            </button>
            <button
              type="button"
              onClick={handleClearData}
              className="py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-950/40 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy & About Links */}
      <div className="flex items-center justify-center gap-3 text-xs text-stone-400 dark:text-zinc-500 pt-2">
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="hover:underline cursor-pointer"
        >
          Privacy Policy
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => setShowAbout(true)}
          className="hover:underline cursor-pointer"
        >
          About MoodNote
        </button>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className={`max-w-sm w-full rounded-2xl p-6 border shadow-xl ${cardBgClass} ${cardBorderClass}`}>
            <h3 className={`text-base font-serif font-semibold mb-2 ${textPrimaryClass}`}>Privacy First</h3>
            <div className={`text-xs leading-relaxed space-y-2 mb-4 ${textSecondaryClass}`}>
              <p>MoodNote was built with an uncompromising commitment to privacy:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>No accounts or login required.</li>
                <li>All journals and reflections remain strictly on your device.</li>
                <li>Zero telemetry or tracking on your private entries.</li>
                <li>Biometric Face ID / Fingerprint protection with PIN fallback.</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacy(false)}
              className="w-full py-2 rounded-xl bg-amber-700 text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className={`max-w-sm w-full rounded-2xl p-6 border shadow-xl ${cardBgClass} ${cardBorderClass}`}>
            <h3 className={`text-base font-serif font-semibold mb-1 ${textPrimaryClass}`}>MoodNote</h3>
            <p className="text-xs text-amber-700 dark:text-amber-500 font-medium mb-3">Version 1.0.0 · React Native & Expo</p>
            <p className={`text-xs leading-relaxed mb-4 ${textSecondaryClass}`}>
              A calm, minimal daily journal and mood log designed to help you pause, reflect, and notice emotional patterns over time.
            </p>
            <button
              type="button"
              onClick={() => setShowAbout(false)}
              className="w-full py-2 rounded-xl bg-amber-700 text-white text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
