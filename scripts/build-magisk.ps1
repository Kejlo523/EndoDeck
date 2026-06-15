$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'magisk'
$dist = Join-Path $root 'dist'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
New-Item -ItemType Directory -Path $dist -Force | Out-Null
$modules = [ordered]@{
    'endodeck-core' = 'EndoDeck-Core-Magisk.zip'
    'endodeck-balanced' = 'EndoDeck-Balanced-Magisk.zip'
    'endodeck-oem-huawei-ale-l21' = 'EndoDeck-OEM-Huawei-ALE-L21-Magisk.zip'
}
foreach ($entry in $modules.GetEnumerator()) {
    $modulePath = Join-Path $source $entry.Key
    $zipPath = Join-Path $dist $entry.Value
    if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
    $stream = [IO.File]::Open($zipPath, [IO.FileMode]::CreateNew)
    try {
        $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
        try {
            Get-ChildItem $modulePath -Recurse -File | ForEach-Object {
                $relative = $_.FullName.Substring($modulePath.Length + 1).Replace('\', '/')
                [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } finally { $archive.Dispose() }
    } finally { $stream.Dispose() }
    Write-Output $zipPath
}
