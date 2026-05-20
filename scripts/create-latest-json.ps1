# ============================================================
# create-latest-json.ps1 -- Create latest.json for EchoCompanion updater v0.1.2
#
# Requirements:
#   - Signed v0.1.2 build has been created by build-signed-release.ps1
#   - NSIS setup.exe exists in bundle/nsis/
#   - NSIS setup.exe.sig exists in bundle/nsis/
#
# This script does NOT upload anything.
# It does NOT contain private keys.
# It only creates release-work/latest.json.
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent

$bundleDir = Join-Path $repoRoot "src-tauri"
$bundleDir = Join-Path $bundleDir "target"
$bundleDir = Join-Path $bundleDir "release"
$bundleDir = Join-Path $bundleDir "bundle"
$nsisDir   = Join-Path $bundleDir "nsis"

$releaseWorkDir = Join-Path $repoRoot "release-work"

$version       = "0.1.2"
$releaseTag    = "v0.1.2"
$setupFileName = "EchoCompanion_0.1.2_x64-setup.exe"
$sigFileName   = "EchoCompanion_0.1.2_x64-setup.exe.sig"

$setupFile      = Join-Path $nsisDir $setupFileName
$sigFile        = Join-Path $nsisDir $sigFileName
$latestJsonFile = Join-Path $releaseWorkDir "latest.json"

$releaseUrl = "https://github.com/Jimmy7610/EchoCompanion/releases/download/$releaseTag/$setupFileName"

Write-Host ""
Write-Host "=== EchoCompanion: Create latest.json for v0.1.2 ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $setupFile)) {
    Write-Host "ERROR: Setup file not found:" -ForegroundColor Red
    Write-Host "  $setupFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run scripts/build-signed-release.ps1 first." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $sigFile)) {
    Write-Host "ERROR: Signature file not found:" -ForegroundColor Red
    Write-Host "  $sigFile" -ForegroundColor Red
    Write-Host ""
    Write-Host "Run scripts/build-signed-release.ps1 and confirm signing succeeded." -ForegroundColor Yellow
    exit 1
}

Write-Host "Found: $setupFile" -ForegroundColor Green
Write-Host "Found: $sigFile" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $releaseWorkDir)) {
    New-Item -ItemType Directory -Path $releaseWorkDir | Out-Null
    Write-Host "Created: $releaseWorkDir" -ForegroundColor Green
}

$signature = (Get-Content $sigFile -Raw).Trim()

if ([string]::IsNullOrWhiteSpace($signature)) {
    Write-Host "ERROR: Signature file is empty: $sigFile" -ForegroundColor Red
    exit 1
}

$latest = [ordered]@{
    version  = $version
    notes    = "Testrelease for EchoCompanion updater end-to-end."
    pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    platforms = [ordered]@{
        "windows-x86_64" = [ordered]@{
            signature = $signature
            url       = $releaseUrl
        }
    }
}

$json = $latest | ConvertTo-Json -Depth 10
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($latestJsonFile, $json, $utf8NoBom)

Write-Host "latest.json created:" -ForegroundColor Green
Write-Host "  $latestJsonFile" -ForegroundColor White
Write-Host ""
Write-Host "Release URL:" -ForegroundColor Cyan
Write-Host "  $releaseUrl" -ForegroundColor White
Write-Host ""
Write-Host "Upload these files to GitHub Release $releaseTag :" -ForegroundColor Cyan
Write-Host "  1. $setupFile" -ForegroundColor White
Write-Host "  2. $sigFile" -ForegroundColor White
Write-Host "  3. $latestJsonFile" -ForegroundColor White
Write-Host ""
Write-Host "See docs/github-release-v0.1.2-checklist.md for the full checklist." -ForegroundColor Cyan
Write-Host ""
