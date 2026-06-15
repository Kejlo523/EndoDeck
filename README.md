# EndoDeck Beta

EndoDeck turns a rooted Android 7–11 phone into a USB control deck for Windows 10/11. The desktop application provides the tray, Studio, audio mixer, actions, diagnostics and updates. The Android app renders the deck, caches the offline screen and works without Google services.

## Installation

Public releases contain a Windows installer and portable build. The setup wizard bundles ADB, detects the connected phone, selects the correct APK, installs compatible Magisk profiles and verifies the USB connection. End users do not need Node.js, Python, Android SDK or platform-tools.

Supported phone requirements:

- Android API 24–30
- ARM/ARM64 device
- working Android System WebView
- root and Magisk 22.1 or newer
- USB debugging authorized for the PC

The first unsigned beta installer may trigger Windows SmartScreen. Verify `SHA256SUMS` and the signed release manifest from GitHub Releases.

## Modules

- **EndoDeck Core** provides USB wake, offline behavior, radio control and midnight standby from `00:00` to `07:00`.
- **Balanced Tweaks** is optional and applies reversible animation, standby, scan and dark-theme settings.
- **OEM Huawei ALE-L21** is optional and contains only the P8 Lite charger and double-tap-wake integrations.

System CA replacement is deliberately excluded from the distribution.

## Development

See [Development](docs/DEVELOPMENT.md), [Distribution](docs/DISTRIBUTION.md), [Android profiles](docs/ANDROID_PROFILES.md) and [Recovery](docs/RECOVERY.md).

The project is licensed under the [MIT License](LICENSE). Font Awesome Free, Leaflet and OpenStreetMap retain their respective licenses and attribution requirements.
