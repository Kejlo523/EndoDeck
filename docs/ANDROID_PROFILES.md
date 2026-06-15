# Android profiles

Official support covers API 24–30 with root and Magisk. The setup wizard reads profiles from `resources/device-profiles`.

## Generic

Installs EndoDeck Core and selects the universal or legacy ARM32 APK from the Android API and reported ABIs. It does not touch charger kernel nodes or hardware gestures.

## Huawei P8 Lite ALE-L21

Uses the legacy ARM32 APK and may additionally install Balanced Tweaks and the Huawei OEM module. Battery Guard only writes `/sys/class/hw_power/charger/charge_data/enable_charger` after confirming the exact manufacturer, model and path. Double-tap wake uses the ALE-L21-specific gesture node.

Adding a profile requires a `device-profile-v1` JSON file, detection tests and a physical-device verification entry in the release notes.
