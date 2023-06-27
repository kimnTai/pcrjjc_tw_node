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
});
