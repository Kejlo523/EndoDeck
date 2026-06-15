$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$adb = Join-Path $root 'vendor\platform-tools\adb.exe'
if (-not (Test-Path $adb)) { & (Join-Path $PSScriptRoot 'fetch-platform-tools.ps1') }
$packages = @(
    'EndoDeck-Core-Magisk.zip',
    'EndoDeck-Balanced-Magisk.zip'
)

$model = (& $adb shell getprop ro.product.model).Trim()
if ($model -eq 'ALE-L21') { $packages += 'EndoDeck-OEM-Huawei-ALE-L21-Magisk.zip' }

& (Join-Path $PSScriptRoot 'build-magisk.ps1') | Out-Null

foreach ($package in $packages) {
    $local = Join-Path (Join-Path $root 'dist') $package
    $remote = "/data/local/tmp/$package"
    & $adb push $local $remote | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to push $package" }
    & $adb shell su -c "magisk --install-module $remote"
    if ($LASTEXITCODE -ne 0) { throw "Magisk failed to install $package" }
}

Write-Output 'Modules installed. Reboot the phone to activate them.'
