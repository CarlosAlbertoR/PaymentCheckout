# Mobile App (React Native + Expo)

## Overview

Cross-platform mobile app (Expo SDK 54, React Native 0.81) for a 7-step credit card checkout flow. Uses Redux Toolkit, React Navigation, React Native Paper, react-hook-form + zod, and connects to the Backend API.

## Requirements

- Node.js LTS (18/20)
- npm or yarn
- Android Studio or Xcode (for emulators)

## Setup

```bash
# Install dependencies
npm install

# Optional: set backend URL reachable from device/emulator
# Create mobile/.env
# EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

The app reads `EXPO_PUBLIC_API_URL`. If not set, it defaults to `http://localhost:3000`.

## Run

```bash
npm run start       # Start Expo
npm run android     # Open Android
npm run ios         # Open iOS (macOS)
npm run web         # Web (limited)
```

## Testing

```bash
npm test            # Run tests
npm run test:cov    # Coverage
```

Covered so far: API service, cart slice, currency utils, HomeScreen, PaymentFormScreen. Target >80% by adding tests for Summary/Result/Checkout and thunks.

## Build APK (Android)

Option A: Local debug APK (requires prebuild)

```bash
npx expo prebuild
cd android && ./gradlew assembleDebug
# APK at android/app/build/outputs/apk/debug/app-debug.apk
```

Option B: EAS Build (recommended)

```bash
npm i -g eas-cli
npm run eas:configure
eas build -p android --profile preview
```

## Project Structure

```
src/
├── screens/
├── navigation/
├── store/
├── services/
├── utils/
├── theme/
└── types/
```

## License

MIT
