# ============================================================
# create-updater-key.ps1 -- Generate Tauri updater signing key
#
# Run ONCE only. The key pair is tied to all future releases.
# The PRIVATE key must NEVER be committed to the repo.
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot   = Split-Path $PSScriptRoot -Parent
$signingDir = Join-Path $repoRoot ".tauri-signing"
$keyFile    = Join-Path $signingDir "echocompanion.key"
$pubFile    = "$keyFile.pub"

Write-Host ""
Write-Host "=== EchoCompanion: Generate Tauri signing key ===" -ForegroundColor Cyan
Write-Host ""

# Verify .tauri-signing/ is in .gitignore
$gitignorePath = Join-Path $repoRoot ".gitignore"
$gitignoreContent = Get-Content $gitignorePath -Raw -ErrorAction SilentlyContinue
if ($gitignoreContent -notmatch "\.tauri-signing") {
    Write-Host "ERROR: .tauri-signing/ is not in .gitignore. Add it before continuing." -ForegroundColor Red
    exit 1
}

# Create signing dir if missing
if (-not (Test-Path $signingDir)) {
    New-Item -ItemType Directory -Path $signingDir | Out-Null
    Write-Host "Created: $signingDir" -ForegroundColor Green
}

# Abort if key already exists
if (Test-Path $keyFile) {
    Write-Host "Key already exists: $keyFile" -ForegroundColor Yellow
    Write-Host "Delete it manually if you want to generate a new key." -ForegroundColor Yellow
    Write-Host ""
    if (Test-Path $pubFile) {
        Write-Host "Your PUBLIC key (paste into tauri.conf.json):" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $pubFile
    }
    Write-Host ""
    exit 0
}

Write-Host "Generating key pair in: $signingDir" -ForegroundColor Green
Write-Host ""

# Generate key pair
# Note: the private key file is written to $keyFile
Set-Location $repoRoot
npm run tauri -- signer generate -w "$keyFile"

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Key generation failed (exit code $LASTEXITCODE)." -ForegroundColor Red
    Write-Host "Make sure Rust and Tauri CLI are installed." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "=== Key pair generated ===" -ForegroundColor Green
Write-Host ""
Write-Host "Private key : $keyFile" -ForegroundColor Red
Write-Host "Public key  : $pubFile" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Copy the public key string shown below" -ForegroundColor White
Write-Host "  2. Open src-tauri/tauri.conf.json" -ForegroundColor White
Write-Host "  3. Replace PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY with the public key" -ForegroundColor White
Write-Host "  4. Commit tauri.conf.json (public key is not secret)" -ForegroundColor White
Write-Host "  5. Store the private key safely (e.g. KeePass)" -ForegroundColor White
Write-Host "  6. Never commit the private key file" -ForegroundColor White
Write-Host ""
Write-Host "YOUR PUBLIC KEY:" -ForegroundColor Cyan
Write-Host ""
if (Test-Path $pubFile) {
    Get-Content $pubFile
} else {
    Write-Host "(pub file not found at $pubFile -- check $signingDir)" -ForegroundColor Red
}
Write-Host ""
Write-Host "The private key is NOT shown here. Find it at: $keyFile" -ForegroundColor Red
Write-Host ""
