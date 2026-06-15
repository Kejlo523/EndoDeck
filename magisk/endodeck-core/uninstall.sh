#!/system/bin/sh

STATE_DIR=/data/adb/endodeck
BACKUP="$STATE_DIR/core-settings.backup"
PIDFILE=/data/local/tmp/endodeck-core.pid
[ -f "$PIDFILE" ] && kill "$(cat "$PIDFILE" 2>/dev/null)" 2>/dev/null
/system/bin/endodeckctl restore >/dev/null 2>&1
if [ -f "$BACKUP" ]; then
    while IFS='|' read -r table key value; do
        if [ "$value" = "null" ] || [ -z "$value" ]; then settings delete "$table" "$key"; else settings put "$table" "$key" "$value"; fi
    done < "$BACKUP"
fi
rm -f "$PIDFILE" /data/local/tmp/endodeck-night-standby
