#!/system/bin/sh
GESTURE=/sys/devices/amba.13/f7101000.i2c/i2c-1/1-001c/easy_wakeup_gesture
CHARGER=/sys/class/hw_power/charger/charge_data/enable_charger
[ -e "$CHARGER" ] && echo 1 > "$CHARGER"
[ -e "$GESTURE" ] && echo 0 > "$GESTURE"
settings put secure double_tap_to_wake 0
settings put global double_tap_to_wake 0
