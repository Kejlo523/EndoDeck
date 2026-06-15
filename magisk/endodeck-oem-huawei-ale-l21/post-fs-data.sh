#!/system/bin/sh
OPTIONS=/data/adb/endodeck/options.conf
GESTURE=/sys/devices/amba.13/f7101000.i2c/i2c-1/1-001c/easy_wakeup_gesture
[ -f "$OPTIONS" ] && . "$OPTIONS"
[ "$ENABLE_DT2W" = "1" ] && [ -e "$GESTURE" ] && chmod 0664 "$GESTURE" && echo 1 > "$GESTURE"
