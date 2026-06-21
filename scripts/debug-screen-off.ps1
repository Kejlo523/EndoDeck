param(
  [string]$Serial = "",
  [switch]$RunTrace
)

$ErrorActionPreference = "Stop"

function Find-Adb {
  $candidates = @(
    $env:ADB_PATH,
    (Join-Path $PSScriptRoot "..\vendor\platform-tools\adb.exe"),
    (Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"),
    "adb"
  ) | Where-Object { $_ }

  foreach ($candidate in $candidates) {
    if ($candidate -eq "adb") { return $candidate }
    if (Test-Path $candidate) { return (Resolve-Path $candidate).Path }
  }
  return "adb"
}

function Invoke-Adb {
  param(
    [string[]]$ArgsList,
    [string]$OutputFile
  )
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $script:Adb
  $psi.UseShellExecute = $false
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  foreach ($arg in $ArgsList) {
    if ($psi.ArgumentList) {
      $psi.ArgumentList.Add($arg)
    } else {
      $escaped = $arg.Replace('\', '\\').Replace('"', '\"')
      $psi.Arguments += if ($arg -match '\s|"') { " `"$escaped`"" } else { " $escaped" }
    }
  }
  $process = [System.Diagnostics.Process]::Start($psi)
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()
  $text = "exit=$($process.ExitCode)`nstdout:`n$stdout`nstderr:`n$stderr"
  $text | Out-File -FilePath $OutputFile -Encoding utf8
  return $text
}

function Invoke-Shell {
  param(
    [string]$Name,
    [string]$Command
  )
  $safeName = $Name -replace '[^a-zA-Z0-9_.-]', '_'
  $file = Join-Path $script:OutputDir "$safeName.txt"
  "adb shell $Command" | Out-File -FilePath $file -Encoding utf8
  Invoke-Adb -ArgsList @("-s", $script:Serial, "shell", $Command) -OutputFile $file | Out-Null
}

$script:Adb = Find-Adb
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$baseDir = Join-Path $env:APPDATA "EndoDeck\diagnostics"
$script:OutputDir = Join-Path $baseDir "screen-off-$stamp"
New-Item -ItemType Directory -Force -Path $script:OutputDir | Out-Null

if (-not $Serial) {
  $devices = Invoke-Adb -ArgsList @("devices") -OutputFile (Join-Path $script:OutputDir "adb-devices.txt")
  $Serial = ($devices -split "`r?`n" | Where-Object { $_ -match "`tdevice" } | Select-Object -First 1) -replace "`tdevice.*$", ""
}

if (-not $Serial) {
  throw "Nie znaleziono telefonu ADB. Podłącz urządzenie i zaakceptuj debugowanie USB."
}

$script:Serial = $Serial

@"
EndoDeck screen-off diagnostics
Time: $(Get-Date -Format o)
ADB: $script:Adb
Serial: $script:Serial
RunTrace: $RunTrace
"@ | Out-File -FilePath (Join-Path $script:OutputDir "README.txt") -Encoding utf8

Invoke-Adb -ArgsList @("-s", $script:Serial, "get-state") -OutputFile (Join-Path $script:OutputDir "adb-state.txt") | Out-Null
Invoke-Shell -Name "props" -Command "getprop ro.product.manufacturer; getprop ro.product.model; getprop ro.build.version.release; getprop ro.build.version.sdk"
Invoke-Shell -Name "root-id" -Command "su -c id"
Invoke-Shell -Name "magisk-version" -Command "su -c 'magisk -v'"
Invoke-Shell -Name "endodeck-status-before" -Command "su -c '/system/bin/endodeckctl status'"
Invoke-Shell -Name "endodeck-diag-before" -Command "su -c '/system/bin/endodeckctl diag'"
Invoke-Shell -Name "dumpsys-power-before" -Command "dumpsys power"
Invoke-Shell -Name "dumpsys-display-before" -Command "dumpsys display"
Invoke-Shell -Name "dumpsys-window-before" -Command "dumpsys window"

if ($RunTrace) {
  Invoke-Shell -Name "screen-off-trace" -Command "su -c '/system/bin/endodeckctl screen-off --trace'"
  Start-Sleep -Seconds 2
  Invoke-Shell -Name "endodeck-status-after-screen-off" -Command "su -c '/system/bin/endodeckctl status'"
  Invoke-Shell -Name "endodeck-diag-after-screen-off" -Command "su -c '/system/bin/endodeckctl diag'"
  Invoke-Shell -Name "wake-restore" -Command "su -c '/system/bin/endodeckctl wake'"
}

Invoke-Shell -Name "screen-off-trace-log-tail" -Command "su -c 'tail -n 320 /data/local/tmp/endodeck-screen-off-trace.log'"
Invoke-Shell -Name "core-log-tail" -Command "su -c 'tail -n 240 /data/local/tmp/endodeck-core.log'"

Write-Host "Zapisano diagnostykę: $script:OutputDir"
if (-not $RunTrace) {
  Write-Host "Tryb bezpieczny: nie gaszono ekranu. Dodaj -RunTrace, aby wykonać realny test screen-off."
}
