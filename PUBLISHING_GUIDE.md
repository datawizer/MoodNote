# MoodNote — Production Publishing & Release Guide

This handbook walks you through publishing **MoodNote** to the **Apple App Store** and **Google Play Store** using EAS (Expo Application Services).

---

## 📋 1. Prerequisites

1. **Apple Developer Account** ($99/year) — [developer.apple.com](https://developer.apple.com)
2. **Google Play Console Account** ($25 one-time) — [play.google.com/console](https://play.google.com/console)
3. **Expo Account** (Free or On-demand) — [expo.dev](https://expo.dev)
4. **EAS CLI**, run through npx (`npx eas-cli@latest <command>`). The commands below write `eas` for short.

---

## ⚙️ 2. Project Setup & EAS Initialization

From the repository root, log in to your Expo account:

```bash
eas login
```

Link your project to your Expo account (this will populate your `projectId` in `app.json`):

```bash
eas init
```

Verify that `eas.json` is configured with production profiles (already provided in the repository).

---

## 🔑 3. Connecting In-App Purchases

Purchases are simulated in this build (`STORE_CONNECTED = false` in `src/services/purchases.ts`), and the paywall shows a "Test mode" notice.

1. Install RevenueCat: `npx expo install react-native-purchases` (this needs a development build; it won't run in Expo Go).
2. In RevenueCat, create the entitlement `premium` and the offerings `monthly`, `yearly` (with a 7-day trial) and `lifetime`.
3. Implement `purchase()` and `restore()` in `src/services/purchases.ts` with the RevenueCat SDK, read the API keys from `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`, and set `STORE_CONNECTED = true`.
4. On launch, check the `premium` entitlement and sync it to `settings.isPremium`.

---

## 🏗️ 4. Building with EAS Build

### Build for iOS (App Store .ipa):
```bash
eas build --platform ios --profile production
```
*EAS automatically handles distribution certificates and provisioning profiles.*

### Build for Android (Google Play .aab bundle):
```bash
eas build --platform android --profile production
```
*EAS automatically generates and manages your Android upload keystore securely in the cloud.*

---

## 🚀 5. Submitting to Stores

### Automatic Submission via EAS Submit:
```bash
# Submit to Apple App Store Connect
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

Alternatively, download the `.ipa` and `.aab` files from your Expo dashboard and upload manually via **Transporter** (macOS) or Google Play Console web interface.

---

## 📝 6. Store Listing & Metadata

### App Store Connect:
- **Primary Category**: Health & Fitness or Lifestyle
- **Secondary Category**: Productivity
- **Age Rating**: 4+ (No unrestricted web access, no user-generated public content)
- **App Privacy Nutrition Labels**:
  - *Data Not Collected*: All journal entries and mood scores remain strictly offline on the user's device.
  - *Data Used to Track You*: None.
  - *Third-Party SDK Data*: Purchase history (RevenueCat, once connected). MoodNote shows no ads.

### Google Play Console:
- **Category**: Lifestyle
- **Data Safety Form**:
  - Does your app collect or share any user data? Purchase history only, through the store or RevenueCat. No journal data leaves the device.
  - Is data encrypted in transit? **Yes**.
  - Can users request data deletion? **Yes** ("Delete all entries" in Settings).
- **Target Audience**: 13+ or General Audience.
