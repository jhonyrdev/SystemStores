import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

const apiTarget = process.env.VITE_API_URL ?? "http://localhost:8080";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@components",
        replacement: path.resolve(path.join(__dirname, "/src/components")),
      },
      {
        find: "@pages",
        replacement: path.resolve(path.join(__dirname, "/src/pages")),
      },
      {
        find: "@layout",
        replacement: path.resolve(path.join(__dirname, "/src/layout")),
      },
      {
        find: "@routes",
        replacement: path.resolve(path.join(__dirname, "/src/routes")),
      },
      {
        find: "@utils",
        replacement: path.resolve(path.join(__dirname, "/src/utils")),
      },
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});