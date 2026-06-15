# Development

## Requirements

- Windows 10/11 x64
- Node.js 22+
- JDK 17
- Android SDK with platform 36
- .NET SDK 8

Install JavaScript dependencies with `npm ci`. Run the backend with `npm start` or the desktop shell with `npm run desktop`.

User data is never read from tracked files. Development runs use `%APPDATA%\EndoDeck`; set `ENDODECK_DATA_DIR` to isolate a test profile.

## Builds

- `npm run check` validates JavaScript syntax.
- `npm test` runs configuration and profile tests.
- `npm run build:native` creates the self-contained Windows Core Audio helper.
- `npm run build:android` creates universal and legacy ARM32 APK variants.
- `npm run build:magisk` creates the Core, Balanced and Huawei modules.
- `npm run release` creates all desktop and phone artifacts.

The existing UI files can evolve independently. The distribution boundary is the HTTP API and the versioned configuration schema.
