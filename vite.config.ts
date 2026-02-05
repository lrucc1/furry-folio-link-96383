import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Lovable Cloud provides backend credentials as server-side env vars.
  // Our client is auto-generated to read VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
  // In some preview environments, only SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are present.
  // These defines ensure the client always receives required values.
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
    ),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? ''
    ),
  },
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    sourcemap: mode === "development",
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
