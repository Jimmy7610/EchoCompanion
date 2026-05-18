# EchoCompanion — Desktop Packaging Notes

## Status (Build 11)

Desktop packaging is **not yet finalized**. The app runs well in browser mode via `npm run dev`.
Tauri is configured but requires Rust to build the native binary.

---

## Requirements for Desktop Build

| Tool | Purpose | Install |
|------|---------|---------|
| Rust + Cargo | Compile Tauri/native layer | rustup.rs |
| Tauri CLI | Build commands | included via npm devDependencies |
| Node.js | Frontend build | nodejs.org |

Install Rust:
```
winget install Rustlang.Rustup
# or visit https://rustup.rs
```

After Rust is installed, verify with:
```
rustc --version
cargo --version
```

Then run the desktop app in dev mode:
```
npm run tauri:dev
```

---

## App Icons

Tauri expects icons in `src-tauri/icons/`.

Required files:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS — optional for Windows-only)
- `icon.ico` (Windows)

### Generating placeholder icons

Once Rust and Tauri CLI are installed, you can generate placeholder icons from a source PNG:
```
npm run tauri icon path/to/source-icon.png
```

This auto-generates all required sizes from a single 1024x1024 source image.

### Recommended icon style for EchoCompanion

- Dark circular background (matches the app's dark premium theme)
- Cyan/purple accent glow — matching `--accent-text` and `--status-online` CSS variables
- Central symbol: the ⬡ hexagon motif already used in the welcome screen
- Simple enough to read clearly at 32x32 px
- No text in the icon — just the symbol

### Status

No final icon has been added yet. Placeholder icons may be needed before `tauri:build` succeeds.
If the build fails due to missing icons, use `npm run tauri icon` with any temporary PNG first.

---

## Build Output

After `npm run tauri:build`, the installer will appear in:
```
src-tauri/target/release/bundle/
```

For Windows:
- `nsis/EchoCompanion_0.1.0_x64-setup.exe` (NSIS installer)
- `msi/EchoCompanion_0.1.0_x64_en-US.msi` (MSI installer)

---

## Tauri Config Reference

File: `src-tauri/tauri.conf.json`

Key values to keep in sync with `src/data/appInfo.ts` and `package.json`:
- `version` — app version
- `productName` — display name
- `identifier` — reverse-domain identifier (`se.jimmyeliasson.echocompanion`)
- Window `width` / `height` — default window size
- Window `minWidth` / `minHeight` — minimum window size

---

## Version Sync Checklist

When bumping the version:
1. `src/data/appInfo.ts` — update `APP_VERSION` and `APP_BUILD`
2. `src-tauri/tauri.conf.json` — update `version`
3. `package.json` — update `version`
4. `README.md` — add new build section
