$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$android = Join-Path $root 'android'
$dist = Join-Path $root 'dist'
$gradle = Join-Path $android 'gradlew.bat'
$androidStudioJbr = 'C:\Program Files\Android\Android Studio\jbr'

if (-not $env:JAVA_HOME -and (Test-Path (Join-Path $androidStudioJbr 'bin\java.exe'))) {
    $env:JAVA_HOME = $androidStudioJbr
    $env:PATH = "$(Join-Path $androidStudioJbr 'bin');$env:PATH"
}

if (-not $env:ANDROID_HOME) {
    $defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
    if (Test-Path $defaultSdk) {
        $env:ANDROID_HOME = $defaultSdk
        $env:ANDROID_SDK_ROOT = $defaultSdk
    }
}

& $gradle -p $android clean
if ($LASTEXITCODE -ne 0) { throw 'Gradle clean failed.' }
node (Join-Path $PSScriptRoot 'prepare-android-assets.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Android offline asset preparation failed.' }
node (Join-Path $PSScriptRoot 'generate-legacy-abi.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Legacy ARM32 ABI anchor generation failed.' }
& $gradle -p $android assembleUniversalRelease assembleLegacyArm32Release
if ($LASTEXITCODE -ne 0) { throw 'Gradle failed to build the APK files.' }
New-Item -ItemType Directory -Path $dist -Force | Out-Null
Copy-Item (Join-Path $android 'app\build\outputs\apk\universal\release\app-universal-release.apk') (Join-Path $dist 'EndoDeck-universal.apk') -Force
Copy-Item (Join-Path $android 'app\build\outputs\apk\legacyArm32\release\app-legacyArm32-release.apk') (Join-Path $dist 'EndoDeck-legacy-arm32.apk') -Force
Write-Output (Join-Path $dist 'EndoDeck-universal.apk')
Write-Output (Join-Path $dist 'EndoDeck-legacy-arm32.apk')
