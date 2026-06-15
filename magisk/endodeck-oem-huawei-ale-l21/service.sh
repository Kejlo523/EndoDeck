#!/system/bin/sh

PIDFILE=/data/local/tmp/endodeck-oem-huawei.pid
OPTIONS=/data/adb/endodeck/options.conf
GESTURE=/sys/devices/amba.13/f7101000.i2c/i2c-1/1-001c/easy_wakeup_gesture
CHARGER=/sys/class/hw_power/charger/charge_data/enable_charger
[ -f "$OPTIONS" ] && . "$OPTIONS"
: "${ENABLE_DT2W:=0}"
: "${ENABLE_BATTERY_GUARD:=0}"
: "${BATTERY_GUARD_STOP_PERCENT:=75}"
: "${BATTERY_GUARD_START_PERCENT:=65}"

if [ "$1" != "--worker" ]; then
    if [ -f "$PIDFILE" ]; then old=$(cat "$PIDFILE" 2>/dev/null); [ -n "$old" ] && kill -0 "$old" 2>/dev/null && exit 0; fi
    nohup sh "$0" --worker >/dev/null 2>&1 &
    exit 0
fi

echo $$ > "$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT INT TERM
while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 3; done

if [ "$ENABLE_DT2W" = "1" ] && [ -e "$GESTURE" ]; then
    settings put secure double_tap_to_wake 1
    settings put global double_tap_to_wake 1
    chmod 0664 "$GESTURE"
    echo 1 > "$GESTURE"
fi

state=enabled
while true; do
    if [ "$ENABLE_BATTERY_GUARD" = "1" ] && [ -e "$CHARGER" ]; then
        capacity=$(cat /sys/class/power_supply/Battery/capacity 2>/dev/null)
        case "$capacity" in ''|*[!0-9]*) ;; *)
            if [ "$capacity" -ge "$BATTERY_GUARD_STOP_PERCENT" ] && [ "$state" != paused ]; then echo 0 > "$CHARGER" && state=paused; fi
            if [ "$capacity" -le "$BATTERY_GUARD_START_PERCENT" ] && [ "$state" != enabled ]; then echo 1 > "$CHARGER" && state=enabled; fi
        esac
    fi
    sleep 20
done
