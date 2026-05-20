# ============================================================
# rotate-updater-key.ps1 -- Rotate Tauri updater signing key
#
# Run this when the old signing key/password has been exposed.
# The old key folder is archived (renamed), not deleted.
# A new key pair is generated in .tauri-signing/.
#
# SAFETY:
# - Does NOT commit anything
# - Does NOT modify tauri.conf.json automatically
# - Does NOT print the private key
# - Refuses to run if git working tree has uncommitted changes
# ============================================================

$ErrorActionPreference = "Stop"

$repoRoot   = Split-Path $PSScriptRoot -Parent
$signingDir = Join-Path $repoRoot ".tauri-signing"
$createKeyScript = Join-Path $PSScriptRoot "create-updater-key.ps1"

Write-Host ""
Write-Host "=== EchoCompanion: Rotate Tauri updater signing key ===" -ForegroundColor Cyan
Write-Host ""

# --- Safety check: verify no private key env vars are set ---
if ($env:TAURI_SIGNING_PRIVATE_KEY) {
    Write-Host "WARNING: TAURI_SIGNING_PRIVATE_KEY is currently set in this session." -ForegroundColor Yellow
    Write-Host "Clear it before rotating: `$env:TAURI_SIGNING_PRIVATE_KEY = `$null" -ForegroundColor Yellow
    Write-Host ""
}

# --- Safety check: git working tree must be clean (no tracked changes) ---
Set-Location $repoRoot
$gitStatus = git status --porcelain 2>&1
$dirtyLines = $gitStatus | Where-Object { $_ -notmatch "^\?\?" }
if ($dirtyLines) {
    Write-Host "ERROR: Git working tree has uncommitted changes." -ForegroundColor Red
    Write-Host "Commit or stash all changes before rotating the signing key." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Dirty files:" -ForegroundColor Yellow
    $dirtyLines | ForEach-Object { Write-Host "  $_" }
    Write-Host ""
    exit 1
}

Write-Host "Git working tree: clean" -ForegroundColor Green
Write-Host ""

# --- Archive old signing key folder ---
if (Test-Path $signingDir) {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $archiveName = ".tauri-signing-old-test-key-$timestamp"
    $archivePath = Join-Path $repoRoot $archiveName
    Write-Host "Archiving old key folder:" -ForegroundColor Yellow
    Write-Host "  $signingDir" -ForegroundColor White
    Write-Host "  -> $archivePath" -ForegroundColor White
    Rename-Item -Path $signingDir -NewName $archiveName
    Write-Host "Done. Old key folder archived (not deleted)." -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: The archived folder is gitignored." -ForegroundColor Cyan
    Write-Host "You may delete it manually once the new key is confirmed working." -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "No existing .tauri-signing/ folder found. Proceeding to generate new key." -ForegroundColor Yellow
    Write-Host ""
}

# --- Generate new key pair ---
Write-Host "Generating new key pair..." -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $createKeyScript)) {
    Write-Host "ERROR: create-updater-key.ps1 not found at: $createKeyScript" -ForegroundColor Red
    exit 1
}

& $createKeyScript

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Key generation failed." -ForegroundColor Red
    exit 1
}

# --- Next steps ---
Write-Host ""
Write-Host "=== NEXT STEPS ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Copy the PUBLIC KEY shown above." -ForegroundColor White
Write-Host "   (It starts with 'untrusted comment: ...' or a long base64 string)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Open: src-tauri/tauri.conf.json" -ForegroundColor White
Write-Host "   Replace the 'pubkey' value with the new public key string." -ForegroundColor White
Write-Host ""
Write-Host "3. Verify no private key is staged:" -ForegroundColor White
Write-Host "   git status" -ForegroundColor Gray
Write-Host "   git status --ignored" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Commit ONLY safe files:" -ForegroundColor White
Write-Host "   git add src-tauri/tauri.conf.json" -ForegroundColor Gray
Write-Host "   git add docs/ README.md src/data/appInfo.ts src/components/ChatArea.tsx" -ForegroundColor Gray
Write-Host "   git commit -m 'Build 31: rotate updater signing key, use new pubkey'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Build and test with the new key:" -ForegroundColor White
Write-Host "   .\scripts\build-signed-release.ps1" -ForegroundColor Gray
Write-Host "   .\scripts\create-latest-json.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "NEVER commit .tauri-signing/ or the archived .tauri-signing-old-test-key-*/" -ForegroundColor Red
Write-Host ""

