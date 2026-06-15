$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$destination = Join-Path $root 'vendor\platform-tools'
if (Test-Path (Join-Path $destination 'adb.exe')) { Write-Output $destination; exit 0 }
$zip = Join-Path $env:TEMP 'endodeck-platform-tools.zip'
$extract = Join-Path $env:TEMP 'endodeck-platform-tools'
Invoke-WebRequest 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip' -OutFile $zip -UseBasicParsing
if (Test-Path $extract) { Remove-Item $extract -Recurse -Force }
Expand-Archive $zip $extract -Force
New-Item -ItemType Directory -Path (Split-Path $destination -Parent) -Force | Out-Null
Copy-Item (Join-Path $extract 'platform-tools') $destination -Recurse -Force
Write-Output $destination
