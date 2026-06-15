$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    npm ci
    npm run prepare:assets
    & (Join-Path $PSScriptRoot 'fetch-platform-tools.ps1') | Out-Null
    npm run build:native
    npm run build:android
    npm run build:magisk
    npm run check
    npm test
    npm run release:manifest
    npm run build:desktop
    npm sbom --sbom-format=cyclonedx | Set-Content (Join-Path $root 'release\EndoDeck-SBOM.cdx.json') -Encoding utf8
    npm run release:manifest
} finally { Pop-Location }
