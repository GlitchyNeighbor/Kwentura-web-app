Kwentura — Install APK on Android (for end users) and test with dummy accounts

Purpose
This file explains, in simple user-facing steps, how to install the Kwentura APK on an Android phone and how to sign in using provided dummy accounts for testing.

Requirements
- Android phone (Android 12.0+ recommended)
- APK file (e.g., Kwentura-release.apk) provided by your administrator or downloaded to your PC
- If installing from PC: USB cable and (optional) ADB installed on Windows, or use simple file transfer

Quick install (recommended — install directly on phone)
1. Allow installs from unknown sources:
   - Android 8+ : Settings → Apps & notifications → Advanced → Special app access → Install unknown apps → choose your File Manager or Browser → Allow.
   - Older Android: Settings → Security → enable "Unknown sources".

2. Transfer the APK to the phone:
   - Option A: Download the APK directly on the phone (from a trusted location).
   - Option B: Connect phone to PC, copy the APK to the Downloads folder.

3. Install:
   - On the phone open a File Manager, go to the APK location, tap the APK, then tap Install.
   - Accept any permissions requested.

4. Open the app after installation.

Install via USB from Windows (optional — for advanced users)
1. Enable Developer Options on phone: Settings → About phone → tap Build number 7 times → go back → Developer options → enable USB debugging.
2. On PC, open Command Prompt and run:
   - adb devices   (verify your device appears)
   - adb install -r "C:\path\to\Kwentura-release.apk"
3. Open the app on the phone.

Dummy test accounts (for signing in)
Use these example accounts to test login flows and basic features. Passwords are case-sensitive.

Student account 1
- School ID: 2022-20040818
- Password: Password123


Troubleshooting
- "App not installed" after tapping APK: uninstall any existing Kwentura app version (Settings → Apps → Kwentura → Uninstall) then retry.
- If installation still fails, try enabling "Install unknown apps" for the app you used to open the APK (browser/file manager).
- If using ADB and device not detected: ensure USB debugging is enabled and the phone trusts your PC (accept the prompt on the device).
- If login fails with dummy credentials, confirm you typed the email/password exactly and try toggling network (Wi‑Fi or mobile data).

Security & privacy
- Dummy accounts are for testing only. Do not use real personal data when testing.
- Only install APKs provided by a trusted source (your administrator).

Support
If you need help, contact your project administrator or the person who gave you the APK.

Last updated: October 29, 2025