$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root 'vendor\platform-tools\adb.exe'
if (-not (Test-Path $adb)) { & (Join-Path $PSScriptRoot 'fetch-platform-tools.ps1') }

$sdk = [int]((& $adb shell getprop ro.build.version.sdk).Trim())
$abi = (& $adb shell getprop ro.product.cpu.abi).Trim()
$variant = if ($abi -match 'armeabi' -or $sdk -le 25) { 'legacy-arm32' } else { 'universal' }
$apk = Join-Path $root "dist\EndoDeck-$variant.apk"

if (-not (Test-Path $apk)) { & (Join-Path $PSScriptRoot 'build-android.ps1') }
& $adb install -r $apk
if ($LASTEXITCODE -ne 0) { throw 'EndoDeck installation failed.' }
& $adb reverse tcp:8765 tcp:8765
& $adb shell am start -n pl.endozero.endodeck/.MainActivity
Write-Output "Installed $variant APK on API $sdk ($abi)."
