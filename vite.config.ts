import { defineConfig } from "vite";
import fs from "vite-plugin-fs";
import { join } from "path";

export default defineConfig({
  plugins: [fs()],
  resolve: {
    alias: {
      "@": join(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/apk": {
        target: "https://apk-dl.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apk/, ""),
      },
      "/game": {
        target: "https://api-pc.so-net.tw",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/game/, ""),
      },
    },
  },
});
