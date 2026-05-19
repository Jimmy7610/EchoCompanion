# ============================================================
# create-latest-json.ps1 -- Create release-work/latest.json
#
# Requirements:
#   - scripts/build-signed-release.ps1 has been run
#   - Tauri build created the .sig file
#
# Contains NO private keys.
# Upload latest.json to GitHub Releases tag v0.1.1.
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot   = Split-Path $PSScriptRoot -Parent
$version    = "0.1.1"
$releaseTag = "v$version"
$notes      = "Test release for EchoCompanion updater v0.1.1"
$pubDate    = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")

# Expected paths (Tauri v2 NSIS artifacts)
$nsisDir     = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "nsis"
$sigFileNsis = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.nsis.zip.sig"
$sigFileExe  = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.exe.sig"

# GitHub Releases URLs
$baseUrl     = "https://github.com/Jimmy7610/EchoCompanion/releases/download/$releaseTag"
$urlNsisZip  = "$baseUrl/EchoCompanion_${version}_x64-setup.nsis.zip"
$urlExe      = "$baseUrl/EchoCompanion_${version}_x64-setup.exe"

Write-Host ""
Write-Host "=== EchoCompanion: Create latest.json ===" -ForegroundColor Cyan
Write-Host ""

# Pick sig file -- try .nsis.zip.sig first (Tauri v2 standard), then .exe.sig
$sigFile    = $null
$releaseUrl = $null

if (Test-Path $sigFileNsis) {
    $sigFile    = $sigFileNsis
    $releaseUrl = $urlNsisZip
    Write-Host "Found signature (NSIS zip): $sigFileNsis" -ForegroundColor Green
} elseif (Test-Path $sigFileExe) {
    $sigFile    = $sigFileExe
    $releaseUrl = $urlExe
    Write-Host "Found signature (exe): $sigFileExe" -ForegroundColor Green
} else {
    Write-Host "ERROR: No .sig file found." -ForegroundColor Red
    Write-Host "Expected one of:" -ForegroundColor Yellow
    Write-Host "  $sigFileNsis" -ForegroundColor Yellow
    Write-Host "  $sigFileExe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Run scripts/build-signed-release.ps1 with TAURI_SIGNING_PRIVATE_KEY set." -ForegroundColor Yellow
    exit 1
}

# Read signature
$signature = (Get-Content $sigFile -Raw).Trim()

if ([string]::IsNullOrWhiteSpace($signature)) {
    Write-Host "ERROR: Sig file is empty: $sigFile" -ForegroundColor Red
    exit 1
}

# Create release-work/ dir
$outDir  = Join-Path $repoRoot "release-work"
$outFile = Join-Path $outDir "latest.json"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Build JSON object
$latestJson = [ordered]@{
    version  = $version
    notes    = $notes
    pub_date = $pubDate
    platforms = [ordered]@{
        "windows-x86_64" = [ordered]@{
            signature = $signature
            url       = $releaseUrl
        }
    }
}

$json = $latestJson | ConvertTo-Json -Depth 5
$enc  = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($outFile, $json, $enc)

Write-Host ""
Write-Host "=== latest.json created ===" -ForegroundColor Green
Write-Host "Path    : $outFile" -ForegroundColor White
Write-Host "Version : $version" -ForegroundColor White
Write-Host "URL     : $releaseUrl" -ForegroundColor White
Write-Host ""
Write-Host "Contents:" -ForegroundColor Cyan
Get-Content $outFile
Write-Host ""
Write-Host "Upload these files to GitHub Release $releaseTag :" -ForegroundColor Cyan

$exeFile = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.exe"
if (Test-Path $exeFile) {
    Write-Host "  $exeFile" -ForegroundColor White
}
if ($sigFile -eq $sigFileNsis) {
    $zipFile = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.nsis.zip"
    if (Test-Path $zipFile) {
        Write-Host "  $zipFile" -ForegroundColor White
    }
    Write-Host "  $sigFileNsis" -ForegroundColor White
} else {
    Write-Host "  $sigFileExe" -ForegroundColor White
}
Write-Host "  $outFile" -ForegroundColor White
Write-Host ""
Write-Host "See docs/github-release-v0.1.1-checklist.md for the full checklist." -ForegroundColor Cyan
Write-Host ""
