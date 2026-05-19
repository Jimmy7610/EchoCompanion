# ============================================================
# build-signed-release.ps1
# Bygger EchoCompanion med Tauri-signeringsstöd.
#
# Kräver:
#   - Rust + Cargo installerat
#   - .tauri-signing/echocompanion.key finns lokalt
#   - Pubkey redan inlagd i src-tauri/tauri.conf.json
#
# Den privata nyckeln skrivs ALDRIG till disk utanför .tauri-signing/.
# Den COMMITTAS ALDRIG till repot.
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Join-Path $PSScriptRoot ".."
$repoRoot = [System.IO.Path]::GetFullPath($repoRoot)
$keyFile  = Join-Path $repoRoot ".tauri-signing" "echocompanion.key"

Write-Host ""
Write-Host "=== EchoCompanion — Signerat release-bygge ===" -ForegroundColor Cyan
Write-Host ""

# 1. Kontrollera att privat nyckel finns
if (-not (Test-Path $keyFile)) {
    Write-Host "FEL: Privat nyckel saknas: $keyFile" -ForegroundColor Red
    Write-Host "Kör scripts/create-updater-key.ps1 först." -ForegroundColor Yellow
    exit 1
}

# 2. Påminn om pubkey
$tauriConf = Get-Content (Join-Path $repoRoot "src-tauri" "tauri.conf.json") -Raw
if ($tauriConf -match "PLACEHOLDER") {
    Write-Host "FEL: tauri.conf.json innehåller fortfarande PLACEHOLDER-pubkey." -ForegroundColor Red
    Write-Host "Kör scripts/create-updater-key.ps1 och kopiera pubkey till tauri.conf.json." -ForegroundColor Yellow
    exit 1
}

Write-Host "Privat nyckel hittad." -ForegroundColor Green
Write-Host "Pubkey verifierad (ingen PLACEHOLDER)." -ForegroundColor Green
Write-Host ""

# 3. Läs in privat nyckel som miljövariabel (läses in i minnet, syns inte i loggar)
$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $keyFile -Raw).Trim()

# Om nyckeln har lösenord — avkommentera och fyll i:
# $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = ""

Write-Host "Steg 1/3 — Typkontroll..." -ForegroundColor Cyan
Set-Location $repoRoot
npm run typecheck
if ($LASTEXITCODE -ne 0) { Write-Host "Typkontroll misslyckades." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Steg 2/3 — Frontend-bygge..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Frontend-bygge misslyckades." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Steg 3/3 — Tauri release-bygge (kan ta 5–15 min)..." -ForegroundColor Cyan
npm run tauri:build
if ($LASTEXITCODE -ne 0) { Write-Host "Tauri-bygge misslyckades." -ForegroundColor Red; exit 1 }

# Rensa signeringsnyckel från minnet
Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== Bygget klart! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Letade efter output-filer:" -ForegroundColor Cyan
$nsisDir = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "nsis"
$msiDir  = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "msi"

if (Test-Path $nsisDir) {
    Write-Host "NSIS:" -ForegroundColor Yellow
    Get-ChildItem $nsisDir | Select-Object Name, Length | Format-Table -AutoSize
} else {
    Write-Host "NSIS-katalog hittades inte: $nsisDir" -ForegroundColor Red
}

if (Test-Path $msiDir) {
    Write-Host "MSI:" -ForegroundColor Yellow
    Get-ChildItem $msiDir | Select-Object Name, Length | Format-Table -AutoSize
} else {
    Write-Host "MSI-katalog hittades inte: $msiDir" -ForegroundColor Red
}

Write-Host ""
Write-Host "Nästa steg: kör scripts/create-latest-json.ps1" -ForegroundColor Cyan
Write-Host ""
