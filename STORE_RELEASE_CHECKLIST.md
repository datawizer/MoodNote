# MoodNote Store Release Checklist

A production checklist for publishing to Apple App Store & Google Play Store.

---

## 🎨 1. Visual Assets & Branding
- [x] **App Icon**: 1024x1024 PNG without transparency (`assets/icon.png`).
- [x] **Adaptive Icon (Android)**: foreground + monochrome layers on `#faf7f2` (`assets/android-icon-*.png`).
- [x] **Splash Screen**: centered mark on `#faf7f2` (light) and `#121214` (dark).
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
  - **RevenueCat** (once connected): declared as "Purchases" for in-app purchases.
  - No advertising SDKs.

### Google Play Data Safety Form
- **Data Collected**: No personal user data collected by the first-party app.
- **Data Shared**: None.
- **Security Practices**:
  - Offline-first on-device storage; the app-lock PIN is kept in the secure keychain.
  - User can request full data deletion directly within app settings (Clear All Data).

---

## 📄 3. Legal & Compliance
- [ ] **Privacy Policy URL**: Hosted public URL explaining zero-retention journal privacy.
- [ ] **Terms of Use (EULA)**: Apple Standard EULA or custom terms linked on paywall screen.
- [ ] **Account Deletion / Data Erase**: Meets Apple Guideline 5.1.1 (MoodNote has "Delete all entries" in Settings).
- [ ] **In-App Purchase Testing**: Verified Sandbox tester accounts in App Store Connect and Google Play Console.
- [x] **Biometrics Permissions**: `faceIDPermission` set on the `expo-local-authentication` plugin in `app.json`.
- [ ] **Purchases connected**: `STORE_CONNECTED = true` in `src/services/purchases.ts` (see PUBLISHING_GUIDE.md).
