$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$apk = Join-Path $root 'dist\EndoDeck.apk'
$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'

if (-not (Test-Path $apk)) { & (Join-Path $PSScriptRoot 'build-android.ps1') }
& $adb install -r $apk
if ($LASTEXITCODE -ne 0) { throw 'EndoDeck installation failed.' }
& $adb reverse tcp:8765 tcp:8765
& $adb shell am start -n pl.endozero.endodeck/.MainActivity
