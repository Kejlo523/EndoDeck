#!/system/bin/sh
ui_print "- Installing EndoDeck Core"
set_perm "$MODPATH/post-fs-data.sh" 0 0 0755
set_perm "$MODPATH/service.sh" 0 0 0755
set_perm "$MODPATH/uninstall.sh" 0 0 0755
set_perm "$MODPATH/system/bin/endodeckctl" 0 0 0755
