import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // Use Babel-based plugin for React
import { tempo } from "tempo-devtools/dist/vite";

// Add this block of code
const conditionalPlugins = [];
if (process.env.TEMPO === "true") {
  conditionalPlugins.push("tempo-devtools/dist/babel-plugin");
}

// https://vitejs.dev/config/
export default defineConfig({
  base:
      process.env.NODE_ENV === "development"
          ? "/"
          : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react({
      babel: {
        plugins: [...conditionalPlugins],
      },
    }),
    tempo(), // Add the tempo plugin
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
