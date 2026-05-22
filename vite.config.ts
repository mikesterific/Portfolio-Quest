import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const base = process.env.VITE_BASE_PATH ?? "/portfolio-quest/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ["phaser"],
  },
  build: {
    // Phaser (~1.5 MB) and Three.js (~530 KB) are isolated vendor chunks; sizes are expected.
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router"],
          phaser: ["phaser"],
          three: ["three"],
        },
      },
    },
  },
});
