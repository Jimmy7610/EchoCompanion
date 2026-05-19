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
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$keyFile  = Join-Path $repoRoot ".tauri-signing" "echocompanion.key"

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
$tauriConf = Get-Content (Join-Path $repoRoot "src-tauri" "tauri.conf.json") -Raw
if ($tauriConf -match "PLACEHOLDER") {
    Write-Host "ERROR: tauri.conf.json still has PLACEHOLDER pubkey." -ForegroundColor Red
    Write-Host "Run create-updater-key.ps1, copy the public key into tauri.conf.json." -ForegroundColor Yellow
    exit 1
}

Write-Host "Private key found." -ForegroundColor Green
Write-Host "Public key verified (no PLACEHOLDER)." -ForegroundColor Green
Write-Host ""

# Load private key into env var (in memory only, not echoed)
$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $keyFile -Raw).Trim()
# If your key has a password, uncomment and set:
# $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""

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

# Clear signing key from memory immediately after build
Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue

if ($buildExitCode -ne 0) {
    Write-Host "Tauri build failed (exit code $buildExitCode)." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Build complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Output files:" -ForegroundColor Cyan

$nsisDir = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "nsis"
$msiDir  = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "msi"

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
