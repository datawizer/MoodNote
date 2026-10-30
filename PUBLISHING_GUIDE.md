# MoodNote — Production Publishing & Release Guide

This handbook walks you through publishing **MoodNote** to the **Apple App Store** and **Google Play Store** using EAS (Expo Application Services).

---

## 📋 1. Prerequisites

1. **Apple Developer Account** ($99/year) — [developer.apple.com](https://developer.apple.com)
2. **Google Play Console Account** ($25 one-time) — [play.google.com/console](https://play.google.com/console)
3. **Expo Account** (Free or On-demand) — [expo.dev](https://expo.dev)
4. **EAS CLI** installed globally:
   ```bash
   npm install -g eas-cli
   ```

---

## ⚙️ 2. Project Setup & EAS Initialization

Navigate to the `expo-project` directory and log in to your Expo account:

```bash
cd expo-project
eas login
```

Link your project to your Expo account (this will populate your `projectId` in `app.json`):

```bash
eas init
```

Verify that `eas.json` is configured with production profiles (already provided in the repository).

---

## 🔑 3. Setting Up Production Keys

Before generating a production release, replace the test keys:

### A. RevenueCat In-App Purchases
1. In `src/services/PurchaseService.ts`:
   - Replace `appl_moodnote_key_placeholder` with your Apple API Key from RevenueCat Dashboard.
   - Replace `goog_moodnote_key_placeholder` with your Google API Key from RevenueCat Dashboard.
2. In RevenueCat:
   - Configure Entitlement: `premium`
   - Configure Offerings: `monthly`, `yearly` (with 7-day trial), and `lifetime`

### B. Google Mobile Ads (AdMob)
1. In `app.json` under `react-native-google-mobile-ads`:
   - Replace `androidAppId` with your production AdMob Android App ID (`ca-app-pub-XXXXXXXX~YYYYYYYY`).
   - Replace `iosAppId` with your production AdMob iOS App ID (`ca-app-pub-XXXXXXXX~YYYYYYYY`).
2. In `src/services/AdService.ts`:
   - Replace test banner and interstitial unit IDs with your production unit IDs.

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
  - *Third-Party SDK Data*: Device identifier (AdMob non-personalized contextual ads) and Purchase history (RevenueCat).

### Google Play Console:
- **Category**: Lifestyle
- **Data Safety Form**:
  - Does your app collect or share any user data? **Yes** (Device IDs for ad serving; no personal journal data leaves device).
  - Is data encrypted in transit? **Yes**.
  - Can users request data deletion? **Yes** (Single-tap "Reset Data" in Settings).
- **Target Audience**: 13+ or General Audience.
