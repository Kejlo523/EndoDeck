$root = Split-Path -Parent $PSScriptRoot
$startup = [Environment]::GetFolderPath('Startup')
$shortcutPath = Join-Path $startup 'EndoDeck.lnk'
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = 'powershell.exe'
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$(Join-Path $PSScriptRoot 'start-endodeck.ps1')`""
$shortcut.WorkingDirectory = $root
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,168"
$shortcut.Save()
Write-Output $shortcutPath
