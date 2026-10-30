# MoodNote

A calm, private daily journal and mood log for iOS and Android, built with Expo (SDK 58), Expo Router and SQLite. Everything stays on the device: no account, no cloud, no analytics.

## Features

- **Today**: one-tap mood check-in, a daily writing prompt, and your last 7 days at a glance
- **Journal**: search and filter entries by mood or activity, grouped by month
- **Calendar**: a month view coloured by mood, with monthly entry count and average
- **Insights**: streaks, mood trend (7 or 30 days), mood distribution, activities, weekday patterns
- **Privacy**: PIN lock (stored in the secure keychain) with Face ID or fingerprint unlock, and auto-lock after 30 seconds in the background
- **Reminders**: a daily local notification at a time you choose
- **Export**: Markdown, PDF and a full JSON backup through the share sheet, plus restore from a backup
- **Themes**: 2 free and 4 supporter themes

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` for an emulator or simulator. Face ID on iOS needs a development build (`npx expo run:ios` or `eas build --profile development`). Everything else works in Expo Go.

## Checks

```bash
npm run typecheck   # tsc
npm run lint        # expo lint
npm test            # journal logic unit tests
npm run doctor      # expo-doctor
```

## Project layout

```
src/app/            Expo Router routes
  (tabs)/           Today, Journal, Calendar, Insights, Settings
  entry.tsx         entry editor (modal)
  paywall.tsx       supporter plans (modal)
src/components/     UI kit and shared components
src/lib/            SQLite data layer, app store, journal logic
src/services/       notifications, security, export, haptics, purchases
src/constants/      themes, prompts, default tags
```

## Before a store release

Purchases are **simulated**: `src/services/purchases.ts` unlocks supporter features without charging, and the paywall says so on screen. Wire up RevenueCat (or StoreKit / Play Billing) there before shipping. See [PUBLISHING_GUIDE.md](PUBLISHING_GUIDE.md) and [STORE_RELEASE_CHECKLIST.md](STORE_RELEASE_CHECKLIST.md).
