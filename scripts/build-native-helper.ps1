$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$sourceScript = Join-Path $PSScriptRoot 'audio-control.ps1'
$project = Join-Path $root 'native\EndoDeck.WindowsHelper'
$generated = Join-Path $project 'AudioCore.generated.cs'
$localDotnet = Join-Path $root 'vendor\dotnet\dotnet.exe'
$dotnet = if (Test-Path $localDotnet) { $localDotnet } else { 'dotnet' }
$content = Get-Content $sourceScript -Raw
$match = [regex]::Match($content, "Add-Type -TypeDefinition @'\r?\n([\s\S]*?)\r?\n'@")
if (-not $match.Success) { throw 'Core Audio source was not found in audio-control.ps1.' }
[IO.File]::WriteAllText($generated, $match.Groups[1].Value, [Text.UTF8Encoding]::new($false))
& $dotnet publish (Join-Path $project 'EndoDeck.WindowsHelper.csproj') -c Release -r win-x64 --self-contained true
if ($LASTEXITCODE -ne 0) { throw 'EndoDeck.WindowsHelper build failed.' }
