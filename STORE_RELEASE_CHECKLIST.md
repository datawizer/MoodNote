# MoodNote Store Release Checklist

A production checklist for publishing to Apple App Store & Google Play Store.

---

## 🎨 1. Visual Assets & Branding
- [ ] **App Icon**: 1024x1024 PNG without transparency (no rounded corners; Apple and Google mask automatically).
- [ ] **Adaptive Icon (Android)**: Foreground image 432x432 PNG + monochrome background `#faf8f5`.
- [ ] **Splash Screen**: 2048x2048 centered logo PNG on solid `#faf8f5` canvas.
- [ ] **App Store Screenshots**:
  - 6.7" iPhone (iPhone 16 Pro Max / 15 Pro Max)
  - 6.5" iPhone (iPhone 11 Pro Max / XS Max)
  - 13" iPad Pro (if iPad enabled)
- [ ] **Google Play Screenshots**:
  - Phone: At least 2 screenshots, 1080x1920 or 1080x2400
  - Feature Graphic: 1024x500 PNG/JPEG (no text near borders)

---

## 🔒 2. Privacy & Data Safety Declarations

### Apple App Store Privacy Nutrition Labels
- **Data Not Collected**: MoodNote is offline-first. Moods, text entries, and journal tags **never leave the user's device**.
- **Third-Party SDKs**:
  - **Google Mobile Ads**: Declared as "Identifiers" (Device ID) for Advertising purposes (non-personalized).
  - **RevenueCat**: Declared as "Purchases" for In-App Purchase functionality.

### Google Play Data Safety Form
- **Data Collected**: No personal user data collected by the first-party app.
- **Data Shared**: Device identifiers shared with Google AdMob for ad serving.
- **Security Practices**:
  - Offline-first on-device encrypted storage.
  - User can request full data deletion directly within app settings (Clear All Data).

---

## 📄 3. Legal & Compliance
- [ ] **Privacy Policy URL**: Hosted public URL explaining zero-retention journal privacy.
- [ ] **Terms of Use (EULA)**: Apple Standard EULA or custom terms linked on paywall screen.
- [ ] **Account Deletion / Data Erase**: Meets Apple Guideline 5.1.1 (MoodNote has a single-tap "Clear All Data" in Settings).
- [ ] **In-App Purchase Testing**: Verified Sandbox tester accounts in App Store Connect and Google Play Console.
- [ ] **Biometrics Permissions**: `NSFaceIDUsageDescription` present in `app.json` with user-friendly copy.
