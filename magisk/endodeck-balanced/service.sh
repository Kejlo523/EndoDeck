#!/system/bin/sh

STATE_DIR=/data/adb/endodeck
BACKUP="$STATE_DIR/balanced-settings.backup"
mkdir -p "$STATE_DIR"
while [ "$(getprop sys.boot_completed)" != "1" ]; do sleep 3; done

backup() {
    table=$1; key=$2
    grep -q "^$table|$key|" "$BACKUP" 2>/dev/null && return
    printf '%s|%s|%s\n' "$table" "$key" "$(settings get "$table" "$key" 2>/dev/null)" >> "$BACKUP"
}

for item in \
    'global window_animation_scale' 'global transition_animation_scale' 'global animator_duration_scale' \
    'global app_standby_enabled' 'global wifi_scan_always_enabled' 'global ble_scan_always_enabled' \
    'global mobile_data_always_on' 'global wifi_suspend_optimizations_enabled' 'secure ui_night_mode' \
    'system accelerometer_rotation' 'system user_rotation'; do
    set -- $item; backup "$1" "$2"
done

dumpsys deviceidle enable all >/dev/null 2>&1
settings put global window_animation_scale 0.5
settings put global transition_animation_scale 0.5
settings put global animator_duration_scale 0.5
settings put global app_standby_enabled 1
settings put global wifi_scan_always_enabled 0
settings put global ble_scan_always_enabled 0
settings put global mobile_data_always_on 0
settings put global wifi_suspend_optimizations_enabled 1
settings put secure ui_night_mode 2
settings put system accelerometer_rotation 0
settings put system user_rotation 1
