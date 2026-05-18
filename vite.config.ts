import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri dev server host - injected by Tauri CLI when running tauri dev
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [react()],

  // Prevent Vite from clearing the terminal on rebuild
  clearScreen: false,

  server: {
    // INSTÄLLNING - Ändra porten här om 1420 redan är upptagen
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: {
      // Tauri kompilerar Rust separat, ignorera dess filer här
      ignored: ["**/src-tauri/**"],
    },
  },
});
