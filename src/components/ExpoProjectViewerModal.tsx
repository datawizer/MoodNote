import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Terminal, BookOpen, ShieldCheck } from 'lucide-react';

interface ExpoProjectViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeCardBg: string;
  themeCardBorder: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
}

export const ExpoProjectViewerModal: React.FC<ExpoProjectViewerModalProps> = ({
  isOpen,
  onClose,
  themeCardBg,
  themeCardBorder,
  themeTextPrimary,
  themeTextSecondary,
}) => {
  const [activeTab, setActiveTab] = useState<'app_json' | 'eas_json' | 'schema' | 'services' | 'commands' | 'checklist' | 'publishing_guide'>('app_json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const contentMap = {
    app_json: {
      title: 'app.json (Expo SDK Config)',
      language: 'json',
      code: `// expo-project/app.json
{
  "expo": {
    "name": "MoodNote",
    "slug": "moodnote",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#faf8f5"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.moodnote.journal",
      "infoPlist": {
        "NSFaceIDUsageDescription": "MoodNote uses Face ID to protect your private journal entries."
      }
    },
    "android": {
      "package": "com.moodnote.journal",
      "permissions": ["USE_BIOMETRIC", "USE_FINGERPRINT", "POST_NOTIFICATIONS"]
    },
    "plugins": [
      "expo-router",
      "expo-sqlite",
      "expo-local-authentication",
      "expo-notifications",
      ["react-native-purchases", { "apiKey": "appl_placeholder" }],
      ["react-native-google-mobile-ads", {
        "androidAppId": "ca-app-pub-3940256099942544~3347511713",
        "iosAppId": "ca-app-pub-3940256099942544~1458002511"
      }]
    ]
  }
}`,
    },
    schema: {
      title: 'SQLite Schema & Migrations (expo-sqlite)',
      language: 'typescript',
      code: `// expo-project/src/db/schema.ts
export const SCHEMA_V1 = \`
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entry_tags (
  entryId TEXT NOT NULL,
  tagId TEXT NOT NULL,
  PRIMARY KEY (entryId, tagId),
  FOREIGN KEY (entryId) REFERENCES entries (id) ON DELETE CASCADE,
  FOREIGN KEY (tagId) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries (date DESC);
CREATE INDEX IF NOT EXISTS idx_entry_tags_entryId ON entry_tags (entryId);
\`;`,
    },
    services: {
      title: 'Native Services (Ads, Purchases, Biometrics)',
      language: 'typescript',
      code: `// expo-project/src/services/AdService.ts
import mobileAds, { BannerAd, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

export class AdService {
  private static interstitialShownThisSession = false;
  private static isWriting = false;

  public static showInterstitial(isPremium: boolean) {
    if (isPremium || this.isWriting || this.interstitialShownThisSession) return;
    const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL);
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
      this.interstitialShownThisSession = true;
    });
    interstitial.load();
  }
}

// expo-project/src/services/PurchaseService.ts
import Purchases from 'react-native-purchases';
export class PurchaseService {
  public static async configure() {
    await Purchases.configure({ apiKey: Platform.OS === 'ios' ? 'appl_key' : 'goog_key' });
  }
  public static async purchase(pkg: any) {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return typeof customerInfo.entitlements.active['premium'] !== 'undefined';
  }
}`,
    },
    commands: {
      title: 'Install Commands & EAS Build Scripts',
      language: 'bash',
      code: `# 1. Install Expo SDK 52 & Dependencies
npx expo install expo-router expo-sqlite expo-local-authentication expo-notifications \\
  expo-file-system expo-sharing expo-haptics zustand react-native-reanimated \\
  react-native-gesture-handler react-native-svg react-native-gifted-charts date-fns

# 2. Install Native AdMob & RevenueCat
npm install react-native-google-mobile-ads react-native-purchases

# 3. Start Expo Dev Server
npx expo start

# 4. Run on iOS / Android Simulator (Development Build)
npx expo run:ios
npx expo run:android

# 5. Build for Production with EAS
eas build --platform ios --profile production
eas build --platform android --profile production`,
    },
    eas_json: {
      title: 'eas.json (EAS Production Build Profiles)',
      language: 'json',
      code: `// expo-project/eas.json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}`,
    },
    publishing_guide: {
      title: 'PUBLISHING_GUIDE.md (Store Release Playbook)',
      language: 'markdown',
      code: `# MoodNote Release Playbook:
1. Initialize EAS:
   $ eas login
   $ eas init

2. Configure Production Keys:
   - RevenueCat: Update keys in PurchaseService.ts
   - AdMob: Update production App ID & ad unit IDs in app.json and AdService.ts

3. Trigger Cloud Production Builds:
   $ eas build --platform ios --profile production
   $ eas build --platform android --profile production

4. Auto-Submit to Stores:
   $ eas submit --platform ios
   $ eas submit --platform android`,
    },
    checklist: {
      title: 'App Store & Google Play Release Checklist',
      language: 'markdown',
      code: `# Store Release Checklist:
1. Assets:
   - 1024x1024 App Icon (no transparency)
   - 432x432 Android Adaptive Foreground + Background #faf8f5
   - 2048x2048 Splash Screen centered
   - iPhone 6.7" & 6.5" screenshots, iPad 13" screenshots

2. Privacy & Data Safety:
   - Declare "Zero Personal Data Collected" (offline-first journal)
   - AdMob: "Device Identifier" for non-personalized advertising
   - RevenueCat: "Purchases" for IAP unlocks
   - Single-tap "Clear All Data" compliant with App Store 5.1.1

3. Info.plist & Android Manifest:
   - NSFaceIDUsageDescription: "MoodNote uses Face ID to protect your private journal entries."
   - POST_NOTIFICATIONS, USE_BIOMETRIC, USE_FINGERPRINT permissions`,
    },
  };

  const current = contentMap[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl h-full sm:h-[88vh] sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border ${themeCardBg} ${themeCardBorder}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between border-stone-200/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${themeTextPrimary}`}>
                React Native & Expo Architecture
              </h2>
              <p className={`text-xs ${themeTextSecondary}`}>
                Production-ready code exported to /expo-project/
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-zinc-700 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close inspector"
            >
              <X className={`w-5 h-5 ${themeTextSecondary}`} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-stone-200/60 dark:border-zinc-700/60 px-4 py-2 gap-1 bg-black/2 dark:bg-white/2">
          {[
            { id: 'app_json', label: 'app.json', icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'eas_json', label: 'eas.json', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'schema', label: 'SQLite Schema', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'services', label: 'Native Services', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
            { id: 'commands', label: 'Install & Build', icon: <Terminal className="w-3.5 h-3.5" /> },
            { id: 'publishing_guide', label: 'Publish Guide', icon: <FileCode className="w-3.5 h-3.5" /> },
            { id: 'checklist', label: 'Store Checklist', icon: <Check className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white font-bold shadow-xs'
                  : 'text-stone-500 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-900 font-mono text-xs sm:text-sm text-stone-200">
          <pre className="whitespace-pre-wrap leading-relaxed select-text">{current.code}</pre>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-stone-800 bg-stone-950 flex items-center justify-between text-[11px] text-stone-400">
          <span>Targeting Expo SDK 52 • React Native 0.76 • TypeScript Strict</span>
          <span className="text-amber-400 font-mono">./expo-project</span>
        </div>
      </div>
    </div>
  );
};
