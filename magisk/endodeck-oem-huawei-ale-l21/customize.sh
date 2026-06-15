#!/system/bin/sh
manufacturer=$(getprop ro.product.manufacturer)
model=$(getprop ro.product.model)
if [ "$manufacturer" != "HUAWEI" ] || [ "$model" != "ALE-L21" ]; then abort "This module only supports HUAWEI ALE-L21"; fi
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/uninstall.sh" 0 0 0755
