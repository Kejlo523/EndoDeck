# Recovery

If the phone does not wake, hold the hardware power button and connect ADB. Run:

```powershell
adb shell su -c /system/bin/endodeckctl restore
adb shell su -c "touch /data/adb/modules/endodeck_core/remove"
adb reboot
```

Balanced Tweaks and OEM modules can be removed by creating `remove` in their module directories. Their uninstall scripts restore saved settings and re-enable charging.

PC configuration and five rotating backups are stored in `%APPDATA%\EndoDeck`. Uninstalling the Windows application intentionally preserves this directory.
