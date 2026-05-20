# ============================================================
# build-signed-release.ps1 -- Build EchoCompanion with signing
#
# Requirements:
#   - Rust + Cargo installed
#   - .tauri-signing/echocompanion.key exists locally
#   - Public key already set in src-tauri/tauri.conf.json
#
# The private key is NEVER written outside .tauri-signing/.
# It is NEVER committed to the repo.
#
# If your key has a password, set before running:
#   $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "your-password"
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot   = Split-Path $PSScriptRoot -Parent
$signingDir = Join-Path $repoRoot ".tauri-signing"
$keyFile    = Join-Path $signingDir "echocompanion.key"

Write-Host ""
Write-Host "=== EchoCompanion: Signed release build ===" -ForegroundColor Cyan
Write-Host ""

# Check private key exists
if (-not (Test-Path $keyFile)) {
    Write-Host "ERROR: Private key not found: $keyFile" -ForegroundColor Red
    Write-Host "Run scripts/create-updater-key.ps1 first." -ForegroundColor Yellow
    exit 1
}

# Check pubkey is not still placeholder
$tauriConfPath = Join-Path $repoRoot "src-tauri"
$tauriConfPath = Join-Path $tauriConfPath "tauri.conf.json"
$tauriConf = Get-Content $tauriConfPath -Raw

if ($tauriConf -match "PLACEHOLDER") {
    Write-Host "ERROR: tauri.conf.json still has PLACEHOLDER pubkey." -ForegroundColor Red
    Write-Host "Run create-updater-key.ps1, copy the public key into tauri.conf.json." -ForegroundColor Yellow
    exit 1
}

Write-Host "Private key found." -ForegroundColor Green
Write-Host "Public key verified (no PLACEHOLDER)." -ForegroundColor Green
Write-Host ""

# Load private key into env var in memory only.
# IMPORTANT: Do not print this value.
$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $keyFile -Raw).Trim()

Set-Location $repoRoot

Write-Host "Step 1/3 -- Type check..." -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue
    Write-Host "Type check failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2/3 -- Frontend build..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue
    Write-Host "Frontend build failed." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3/3 -- Tauri release build (may take 5-15 min)..." -ForegroundColor Cyan
npm run tauri:build
$buildExitCode = $LASTEXITCODE

# Clear signing key from environment immediately after build
Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue

if ($buildExitCode -ne 0) {
    Write-Host "Tauri build failed (exit code $buildExitCode)." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Build complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Output files:" -ForegroundColor Cyan

$bundleDir = Join-Path $repoRoot "src-tauri"
$bundleDir = Join-Path $bundleDir "target"
$bundleDir = Join-Path $bundleDir "release"
$bundleDir = Join-Path $bundleDir "bundle"
$nsisDir   = Join-Path $bundleDir "nsis"
$msiDir    = Join-Path $bundleDir "msi"

if (Test-Path $nsisDir) {
    Write-Host "NSIS:" -ForegroundColor Yellow
    Get-ChildItem $nsisDir | Select-Object Name, Length | Format-Table -AutoSize
} else {
    Write-Host "NSIS dir not found: $nsisDir" -ForegroundColor Red
}

if (Test-Path $msiDir) {
    Write-Host "MSI:" -ForegroundColor Yellow
    Get-ChildItem $msiDir | Select-Object Name, Length | Format-Table -AutoSize
} else {
    Write-Host "MSI dir not found: $msiDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next: run scripts/create-latest-json.ps1" -ForegroundColor Cyan
Write-Host ""
