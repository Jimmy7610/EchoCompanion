# ============================================================
# create-updater-key.ps1
# Genererar minisign-nyckelpar för Tauri updater.
#
# KÖR BARA EN GÅNG — nyckelparet binds till alla framtida releases.
# Den privata nyckeln stannar ALDRIG i repot.
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$keyDir = Join-Path $PSScriptRoot ".." ".tauri-signing"
$keyDir = [System.IO.Path]::GetFullPath($keyDir)
$keyFile = Join-Path $keyDir "echocompanion.key"
$pubFile = "$keyFile.pub"

Write-Host ""
Write-Host "=== EchoCompanion — Generera Tauri-signeringsnyckel ===" -ForegroundColor Cyan
Write-Host ""

# Kontrollera att .tauri-signing/ är gitignorerad
$gitignorePath = Join-Path $PSScriptRoot ".." ".gitignore"
$gitignoreContent = Get-Content $gitignorePath -Raw -ErrorAction SilentlyContinue
if ($gitignoreContent -notmatch "\.tauri-signing") {
    Write-Warning ".tauri-signing/ saknas i .gitignore — lägg till det innan du fortsätter!"
    exit 1
}

# Skapa katalog om den inte finns
if (-not (Test-Path $keyDir)) {
    New-Item -ItemType Directory -Path $keyDir | Out-Null
    Write-Host "Skapade: $keyDir" -ForegroundColor Green
}

# Avbryt om nyckeln redan finns
if (Test-Path $keyFile) {
    Write-Host "Nyckel finns redan: $keyFile" -ForegroundColor Yellow
    Write-Host "Ta bort filen manuellt om du vill generera en ny nyckel." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Din publika nyckel (lägg in i tauri.conf.json):" -ForegroundColor Cyan
    Write-Host ""
    Get-Content $pubFile
    Write-Host ""
    exit 0
}

Write-Host "Genererar nyckelpar i: $keyDir" -ForegroundColor Green
Write-Host ""

# Försök primärt kommando
try {
    npm run tauri signer generate -- -w $keyFile
} catch {
    Write-Host "Primärt kommando misslyckades, försöker alternativ syntax..." -ForegroundColor Yellow
    # Alternativ syntax
    npm run tauri -- signer generate -w $keyFile
}

Write-Host ""
Write-Host "=== Nyckelpar genererat ===" -ForegroundColor Green
Write-Host ""
Write-Host "Privat nyckel : $keyFile" -ForegroundColor Red
Write-Host "Publik nyckel : $pubFile" -ForegroundColor Green
Write-Host ""
Write-Host "VIKTIGT — GÖR DESSA STEG NU:" -ForegroundColor Yellow
Write-Host "  1. Kopiera innehållet i $pubFile" -ForegroundColor White
Write-Host "  2. Öppna src-tauri/tauri.conf.json" -ForegroundColor White
Write-Host '  3. Ersätt "PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY" med pubkey-strängen' -ForegroundColor White
Write-Host "  4. Committa tauri.conf.json (pubkey är inte hemlig)" -ForegroundColor White
Write-Host "  5. Spara privat nyckel på ett säkert ställe (t.ex. KeePass)" -ForegroundColor White
Write-Host ""
Write-Host "DIN PUBLIKA NYCKEL:" -ForegroundColor Cyan
Write-Host ""
Get-Content $pubFile
Write-Host ""
Write-Host "Privat nyckel visas INTE här. Hitta den i: $keyFile" -ForegroundColor Red
Write-Host ""
