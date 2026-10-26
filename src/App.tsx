import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Entry, MoodLevel, Settings, Tag } from './types/journal';
import { THEMES } from './constants/themes';
import { storage } from './db/storage';
import { adService } from './services/adService';
import { calculateStreaks, getTodayDateString } from './utils/journalLogic';

// UI Components
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { TodayView } from './components/TodayView';
import { HistoryView } from './components/HistoryView';
import { CalendarGrid } from './components/CalendarGrid';
import { InsightsCharts } from './components/InsightsCharts';
import { SettingsView } from './components/SettingsView';
import { EntryEditorModal } from './components/EntryEditorModal';
import { PaywallModal } from './components/PaywallModal';
import { AppLockModal } from './components/AppLockModal';
import { AdInterstitialModal } from './components/AdInterstitialModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ExpoProjectViewerModal } from './components/ExpoProjectViewerModal';
import { AdBanner } from './components/AdBanner';

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<Settings>(storage.getSettings());
  const [activeTab, setActiveTab] = useState<TabId>('today');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [activePromptForEditor, setActivePromptForEditor] = useState<string | undefined>(undefined);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isExpoInspectorOpen, setIsExpoInspectorOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);

  const loadData = () => {
    setEntries(storage.getEntries());
    setTags(storage.getTags());
    const currentSettings = storage.getSettings();
    setSettings(currentSettings);

    if (!currentSettings.onboardingCompleted) {
      setIsOnboardingOpen(true);
    }
  };

  useEffect(() => {
    loadData();

    const unsubAds = adService.subscribe((event) => {
      if (event.type === 'interstitial') {
        setIsInterstitialOpen(true);
      }
    });

    return () => unsubAds();
  }, []);

  const themeConfig = THEMES[settings.theme] || THEMES.light;
  const todayStr = getTodayDateString();
  const todayEntry = entries.find((e) => e.date === todayStr);
  const streakStats = calculateStreaks(entries, todayStr);

  const handleUpdateSettings = (partial: Partial<Settings>) => {
    const updated = storage.updateSettings(partial);
    setSettings(updated);
  };

  const handleOpenEditor = (initialMood?: MoodLevel, prompt?: string, targetEntry?: Entry) => {
    adService.setWritingState(true);
    setActivePromptForEditor(prompt);
    if (targetEntry) {
      setEditingEntry(targetEntry);
    } else if (todayEntry && !prompt) {
      setEditingEntry(todayEntry);
    } else {
      setEditingEntry(null);
    }
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    adService.setWritingState(false);
    setIsEditorOpen(false);
    setEditingEntry(null);
    setActivePromptForEditor(undefined);

    if (!settings.isPremium) {
      setTimeout(() => {
        adService.tryShowInterstitial(settings.isPremium, 'after-writing');
      }, 500);
    }
  };

  const handleSaveEntry = (entry: Entry) => {
    storage.saveEntry(entry);
    loadData();
  };

  const handleDeleteEntry = (id: string) => {
    storage.deleteEntry(id);
    loadData();
  };

  const handleQuickMoodSelect = (mood: MoodLevel) => {
    if (todayEntry) {
      const updated: Entry = {
        ...todayEntry,
        mood,
        updatedAt: new Date().toISOString(),
      };
      handleSaveEntry(updated);
    } else {
      handleOpenEditor(mood);
    }
  };

  const handleSelectDateInCalendar = (dateStr: string, existing?: Entry) => {
    if (existing) {
      setEditingEntry(existing);
      setActivePromptForEditor(undefined);
      setIsEditorOpen(true);
    } else {
      setEditingEntry({
        id: `entry-${Date.now()}`,
        date: dateStr,
        title: '',
        body: '',
        mood: 4,
        energy: 3,
        tagIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActivePromptForEditor(undefined);
      setIsEditorOpen(true);
    }
  };

  const handleAddCustomTag = (name: string, color: string): Tag => {
    const newTag: Tag = {
      id: `tag-${Date.now()}`,
      name,
      color,
    };
    storage.saveTag(newTag);
    setTags(storage.getTags());
    return newTag;
  };

  const handleUnlockPremiumSuccess = () => {
    handleUpdateSettings({ isPremium: true });
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if ((tab === 'history' || tab === 'insights') && !settings.isPremium) {
      adService.tryShowInterstitial(settings.isPremium, 'tab-change');
    }
  };

  return (
    <div className={`min-h-screen w-full flex justify-center ${themeConfig.bg} transition-colors duration-200`}>
      {/* Sleek, Minimal Mobile/Desktop Container */}
      <div
        className={`w-full max-w-lg min-h-screen flex flex-col justify-between relative shadow-xs border-x border-black/[0.04] dark:border-white/[0.05] ${themeConfig.bg}`}
      >
        {/* Minimal Header */}
        <Header
          currentStreak={streakStats.currentStreak}
          isLockedEnabled={settings.biometricsEnabled}
          onLockApp={() => handleUpdateSettings({ isLocked: true })}
          textPrimaryClass={themeConfig.textPrimary}
          textSecondaryClass={themeConfig.textSecondary}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 focus:outline-hidden">
          {activeTab === 'today' && (
            <TodayView
              todayEntry={todayEntry}
              onOpenEditor={(initialMood, prompt) => handleOpenEditor(initialMood, prompt)}
              onSelectMood={handleQuickMoodSelect}
              tags={tags}
              cardBgClass={themeConfig.cardBg}
              cardBorderClass={themeConfig.cardBorder}
              textPrimaryClass={themeConfig.textPrimary}
              textSecondaryClass={themeConfig.textSecondary}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              entries={entries}
              tags={tags}
              onSelectEntry={(entry) => {
                setEditingEntry(entry);
                setIsEditorOpen(true);
              }}
              onOpenNewEntry={() => handleOpenEditor()}
              isPremium={settings.isPremium}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              cardBgClass={themeConfig.cardBg}
              cardBorderClass={themeConfig.cardBorder}
              textPrimaryClass={themeConfig.textPrimary}
              textSecondaryClass={themeConfig.textSecondary}
            />
          )}

          {activeTab === 'calendar' && (
            <div className="space-y-4 pb-6">
              <CalendarGrid
                entries={entries}
                onSelectDate={handleSelectDateInCalendar}
                cardBgClass={themeConfig.cardBg}
                cardBorderClass={themeConfig.cardBorder}
                textPrimaryClass={themeConfig.textPrimary}
                textSecondaryClass={themeConfig.textSecondary}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="pb-6">
              <InsightsCharts
                entries={entries}
                tags={tags}
                isPremium={settings.isPremium}
                onOpenPaywall={() => setIsPaywallOpen(true)}
                cardBgClass={themeConfig.cardBg}
                cardBorderClass={themeConfig.cardBorder}
                textPrimaryClass={themeConfig.textPrimary}
                textSecondaryClass={themeConfig.textSecondary}
              />
              <AdBanner
                isPremium={settings.isPremium}
                onOpenPaywall={() => setIsPaywallOpen(true)}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              entries={entries}
              tags={tags}
              onReloadData={loadData}
              onOpenPaywall={() => setIsPaywallOpen(true)}
              onOpenExpoInspector={() => setIsExpoInspectorOpen(true)}
              cardBgClass={themeConfig.cardBg}
              cardBorderClass={themeConfig.cardBorder}
              textPrimaryClass={themeConfig.textPrimary}
              textSecondaryClass={themeConfig.textSecondary}
            />
          )}
        </main>

        {/* Minimal Bottom Dock */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          navBgClass={themeConfig.navBg}
          textPrimaryClass={themeConfig.textPrimary}
          textSecondaryClass={themeConfig.textSecondary}
          navActiveClass={themeConfig.navActive}
        />

        {/* Entry Editor Modal */}
        <EntryEditorModal
          isOpen={isEditorOpen}
          onClose={handleCloseEditor}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          initialEntry={editingEntry}
          initialPrompt={activePromptForEditor}
          tags={tags}
          onAddCustomTag={handleAddCustomTag}
          themeCardBg={themeConfig.cardBg}
          themeCardBorder={themeConfig.cardBorder}
          themeTextPrimary={themeConfig.textPrimary}
          themeTextSecondary={themeConfig.textSecondary}
        />

        {/* Supporter / Paywall Modal */}
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          onUnlockSuccess={handleUnlockPremiumSuccess}
          themeCardBg={themeConfig.cardBg}
          themeCardBorder={themeConfig.cardBorder}
          themeTextPrimary={themeConfig.textPrimary}
          themeTextSecondary={themeConfig.textSecondary}
        />

        {/* Biometric & PIN App Lock */}
        <AppLockModal
          isLocked={settings.isLocked && settings.biometricsEnabled}
          onUnlock={() => handleUpdateSettings({ isLocked: false })}
          savedPin={settings.pinCode}
          themeCardBg={themeConfig.cardBg}
          themeCardBorder={themeConfig.cardBorder}
          themeTextPrimary={themeConfig.textPrimary}
          themeTextSecondary={themeConfig.textSecondary}
        />

        {/* Interstitial Ad Simulator */}
        <AdInterstitialModal
          isOpen={isInterstitialOpen}
          onClose={() => setIsInterstitialOpen(false)}
          onOpenPaywall={() => {
            setIsInterstitialOpen(false);
            setIsPaywallOpen(true);
          }}
        />

        {/* Onboarding Modal */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onComplete={(reminderTime) => {
            handleUpdateSettings({
              onboardingCompleted: true,
              reminderTime,
              reminderEnabled: true,
            });
            setIsOnboardingOpen(false);
          }}
          themeCardBg={themeConfig.cardBg}
          themeCardBorder={themeConfig.cardBorder}
          themeTextPrimary={themeConfig.textPrimary}
          themeTextSecondary={themeConfig.textSecondary}
        />

        {/* Expo Architecture & Native Project Files Inspector Modal */}
        <ExpoProjectViewerModal
          isOpen={isExpoInspectorOpen}
          onClose={() => setIsExpoInspectorOpen(false)}
          themeCardBg={themeConfig.cardBg}
          themeCardBorder={themeConfig.cardBorder}
          themeTextPrimary={themeConfig.textPrimary}
          themeTextSecondary={themeConfig.textSecondary}
        />
      </div>
    </div>
  );
}
