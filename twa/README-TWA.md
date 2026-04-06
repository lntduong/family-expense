# Build TWA APK for yang-family.vercel.app

## Prereqs
- Node 18+
- JDK 17+
- Android SDK (ANDROID_HOME set, build-tools 33+)
- npm i -g @bubblewrap/cli

## Steps
1) From repo root: `cd twa`
2) `bubblewrap init --manifest=https://yang-family.vercel.app/manifest.webmanifest --config=twa-manifest.json --skipPwaValidation`
   (config already sets packageId, startUrl, signing key path/alias/password)
3) Build: `bubblewrap build`
   Outputs `app-release-signed.apk` and `.aab` if selected.
4) Install to device: `adb install ./app-release-signed.apk`
5) Host Digital Asset Links
   - File generated at `twa/.well-known/assetlinks.json` during build matches the keystore here.
   - Already placed a copy at `public/.well-known/assetlinks.json` so Vercel will serve it at `https://yang-family.vercel.app/.well-known/assetlinks.json` after deploy.

Keystore used: `twa/twa-release.jks`
- alias: `twa`
- store/key password: `changeit`
- SHA256: `CD:7F:3B:CF:2A:FD:88:D3:BB:5F:6F:2C:3F:99:A9:30:33:84:C6:7B:09:6C:DC:DF:3C:E6:F0:97:01:80:DD:B9`

If you rotate keystore, update `public/.well-known/assetlinks.json` with the new fingerprint and re-deploy.
