# ============================================================
# create-latest-json.ps1
# Skapar release-work/latest.json för Tauri updater.
#
# Förutsättning:
#   - scripts/build-signed-release.ps1 har körts
#   - Tauri-bygget har skapat .sig-filen
#
# Innehåller INGA privata nycklar.
# Filen ska laddas upp till GitHub Releases för tag v0.1.1.
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot   = Join-Path $PSScriptRoot ".."
$repoRoot   = [System.IO.Path]::GetFullPath($repoRoot)
$version    = "0.1.1"
$releaseTag = "v$version"
$notes      = "Testrelease för EchoCompanion updater."
$pubDate    = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")

# Förväntade sökvägar (Tauri v2 NSIS-artefakter)
# Tauri v2 skapar .nsis.zip och .nsis.zip.sig för uppdateraren
$nsisDir      = Join-Path $repoRoot "src-tauri" "target" "release" "bundle" "nsis"
$sigFileNsis  = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.nsis.zip.sig"
$sigFileExe   = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.exe.sig"

# URL:er på GitHub Releases
$baseUrl      = "https://github.com/Jimmy7610/EchoCompanion/releases/download/$releaseTag"
$urlNsisZip   = "$baseUrl/EchoCompanion_${version}_x64-setup.nsis.zip"
$urlExe       = "$baseUrl/EchoCompanion_${version}_x64-setup.exe"

Write-Host ""
Write-Host "=== EchoCompanion — Skapa latest.json ===" -ForegroundColor Cyan
Write-Host ""

# Välj sig-fil — försök .nsis.zip.sig först (Tauri v2 standard), sedan .exe.sig
$sigFile = $null
$releaseUrl = $null

if (Test-Path $sigFileNsis) {
    $sigFile    = $sigFileNsis
    $releaseUrl = $urlNsisZip
    Write-Host "Hittade signatur (NSIS zip): $sigFileNsis" -ForegroundColor Green
} elseif (Test-Path $sigFileExe) {
    $sigFile    = $sigFileExe
    $releaseUrl = $urlExe
    Write-Host "Hittade signatur (exe): $sigFileExe" -ForegroundColor Green
} else {
    Write-Host "FEL: Ingen .sig-fil hittades." -ForegroundColor Red
    Write-Host "Förväntade en av:" -ForegroundColor Yellow
    Write-Host "  $sigFileNsis" -ForegroundColor Yellow
    Write-Host "  $sigFileExe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Kör scripts/build-signed-release.ps1 med TAURI_SIGNING_PRIVATE_KEY satt." -ForegroundColor Yellow
    exit 1
}

# Läs signaturen
$signature = (Get-Content $sigFile -Raw).Trim()

if ([string]::IsNullOrWhiteSpace($signature)) {
    Write-Host "FEL: Sig-filen är tom: $sigFile" -ForegroundColor Red
    exit 1
}

# Skapa release-work/-katalog
$outDir  = Join-Path $repoRoot "release-work"
$outFile = Join-Path $outDir "latest.json"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# Bygg JSON
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
[System.IO.File]::WriteAllText($outFile, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "=== latest.json skapad ===" -ForegroundColor Green
Write-Host "Sökväg  : $outFile" -ForegroundColor White
Write-Host "Version : $version" -ForegroundColor White
Write-Host "URL     : $releaseUrl" -ForegroundColor White
Write-Host ""
Write-Host "Innehåll:" -ForegroundColor Cyan
Get-Content $outFile
Write-Host ""
Write-Host "Nästa steg: ladda upp dessa filer till GitHub Release $releaseTag :" -ForegroundColor Cyan

$exeFile = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.exe"
if (Test-Path $exeFile) {
    Write-Host "  $exeFile" -ForegroundColor White
}
if (Test-Path $sigFileNsis) {
    $zipFile = Join-Path $nsisDir "EchoCompanion_${version}_x64-setup.nsis.zip"
    if (Test-Path $zipFile) { Write-Host "  $zipFile" -ForegroundColor White }
    Write-Host "  $sigFileNsis" -ForegroundColor White
} elseif (Test-Path $sigFileExe) {
    Write-Host "  $sigFileExe" -ForegroundColor White
}
Write-Host "  $outFile" -ForegroundColor White
Write-Host ""
Write-Host "Se docs/github-release-v0.1.1-checklist.md för komplett checklista." -ForegroundColor Cyan
Write-Host ""
