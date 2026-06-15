# Distribution

EndoDeck uses semantic beta versions such as `1.1.0-beta.1`. A matching Git tag is `v1.1.0-beta.1`.

GitHub Actions produces:

- NSIS per-user installer and portable Windows ZIP/EXE
- universal and legacy ARM32 APKs
- EndoDeck Core, Balanced Tweaks and Huawei ALE-L21 Magisk ZIPs
- `release-manifest.json`, Ed25519 signature, `SHA256SUMS` and an SBOM

The Windows package is intentionally unsigned until an Authenticode certificate is available, so SmartScreen may warn on the first installation. Release integrity is independent and uses the Ed25519 manifest signature.

Required repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `RELEASE_ED25519_PRIVATE_KEY`

`ANDROID_KEYSTORE_BASE64` contains the release JKS encoded as one Base64 string. The workflow reconstructs it only for the build. Never commit a private signing key.

The committed `resources/release-public-key.pem` matches the local ignored `.endodeck-release-private.pem`. Before creating a release tag, store that private PEM as `RELEASE_ED25519_PRIVATE_KEY` in GitHub Secrets. Rotating the key requires committing the matching public key in the same release line.
