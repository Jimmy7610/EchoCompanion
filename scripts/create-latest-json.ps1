# ============================================================
# create-latest-json.ps1 -- Create latest.json for EchoCompanion updater
#
# Requirements:
#   - Signed v0.1.1 build has been created
#   - NSIS setup.exe exists
#   - NSIS setup.exe.sig exists
#
# This script does NOT upload anything.
# It only creates release-work/latest.json.
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent

$bundleDir = Join-Path (Join-Path (Join-Path (Join-Path $repoRoot "src-tauri") "target") "release") "bundle"
$nsisDir = Join-Path $bundleDir "nsis"
$releaseWorkDir = Join-Path $repoRoot "release-work"

$version = "0.1.1"
$setupFileName = "EchoCompanion_0.1.1_x64-setup.exe"
$sigFileName = "EchoCompanion_0.1.1_x64-setup.exe.sig"

$setupFile = Join-Path $nsisDir $setupFileName
$sigFile = Join-Path $nsisDir $sigFileName
$latestJsonFile = Join-Path $releaseWorkDir "latest.json"

Write-Host ""
Write-Host "=== EchoCompanion: Create latest.json ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $setupFile)) {
    Write-Host "ERROR: Setup file not found:" -ForegroundColor Red
    Write-Host $setupFile -ForegroundColor Red
    Write-Host ""
    Write-Host "Run scripts/build-signed-release.ps1 first." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $sigFile)) {
    Write-Host "ERROR: Signature file not found:" -ForegroundColor Red
    Write-Host $sigFile -ForegroundColor Red
    Write-Host ""
    Write-Host "Run scripts/build-signed-release.ps1 first and confirm signing succeeded." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $releaseWorkDir)) {
    New-Item -ItemType Directory -Path $releaseWorkDir | Out-Null
    Write-Host "Created: $releaseWorkDir" -ForegroundColor Green
}

$signature = (Get-Content $sigFile -Raw).Trim()

$releaseUrl = "https://github.com/Jimmy7610/EchoCompanion/releases/download/v0.1.1/$setupFileName"

$latest = [ordered]@{
    version = $version
    notes = "Testrelease for EchoCompanion updater."
    pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    platforms = [ordered]@{
        "windows-x86_64" = [ordered]@{
            signature = $signature
            url = $releaseUrl
        }
    }
}

$json = $latest | ConvertTo-Json -Depth 10

# Write UTF-8 without BOM for JSON file
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($latestJsonFile, $json, $utf8NoBom)

Write-Host ""
Write-Host "latest.json created:" -ForegroundColor Green
Write-Host $latestJsonFile
Write-Host ""
Write-Host "Release URL:" -ForegroundColor Cyan
Write-Host $releaseUrl
Write-Host ""
Write-Host "Next files to upload to GitHub Release v0.1.1:" -ForegroundColor Cyan
Write-Host "1. $setupFile"
Write-Host "2. $sigFile"
Write-Host "3. $latestJsonFile"
Write-Host ""