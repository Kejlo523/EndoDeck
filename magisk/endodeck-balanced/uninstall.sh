#!/system/bin/sh
BACKUP=/data/adb/endodeck/balanced-settings.backup
[ -f "$BACKUP" ] || exit 0
while IFS='|' read -r table key value; do
    if [ "$value" = "null" ] || [ -z "$value" ]; then settings delete "$table" "$key"; else settings put "$table" "$key" "$value"; fi
done < "$BACKUP"
rm -f "$BACKUP"
