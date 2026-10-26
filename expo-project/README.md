# MoodNote — Daily Journal & Mood Log

MoodNote is a calm, minimal, offline-first mobile journaling and mood tracking application built with **React Native**, **Expo (SDK 52+)**, **TypeScript**, **Expo Router**, and **SQLite**.

---

## 🚀 Quick Start

### 1. Installation

Install all dependencies using the official Expo CLI:

```bash
cd expo-project
npx expo install
```

### 2. Running in Development

> ⚠️ **Important Note on Expo Go vs EAS Development Build:**
> - Core features (Journaling, SQLite storage, Calendar, Insights, Prompts, Themes, Export) run seamlessly in **Expo Go**.
> - Native plugins (`react-native-google-mobile-ads` and `react-native-purchases`) include custom native code and **require an EAS Development Build** or local prebuild (`npx expo run:ios` / `npx expo run:android`).

To start the local bundler:
```bash
npx expo start
```

To create and run a local iOS simulator / Android emulator build:
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## 💳 RevenueCat & AdMob Configuration

### 1. AdMob Test & Production IDs
Configured in `app.json` under the `react-native-google-mobile-ads` plugin:
- **iOS App ID:** `ca-app-pub-3940256099942544~1458002511` (Test ID)
- **Android App ID:** `ca-app-pub-3940256099942544~3347511713` (Test ID)
- For production, replace these in `app.json` and insert your live ad unit IDs in `src/services/AdService.ts`.

### 2. RevenueCat In-App Purchases
1. Create a project on [RevenueCat](https://www.revenuecat.com/).
2. Create an Entitlement named `premium`.
3. Configure Offerings with packages: `monthly`, `yearly` (with 7-day trial), and `lifetime`.
4. Update API keys in `src/services/PurchaseService.ts`:
   - `REVENUECAT_APPLE_KEY`
   - `REVENUECAT_GOOGLE_KEY`

---

## 📦 Building for Production with EAS

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Log in and initialize:
```bash
eas login
eas build:configure
```

3. Build for iOS (IPA) or Android (AAB):
```bash
# iOS Production App Store build
eas build --platform ios --profile production

# Android Google Play Store AAB build
eas build --platform android --profile production
```

4. Automatically submit to App Store and Google Play:
```bash
eas submit --platform all
```
