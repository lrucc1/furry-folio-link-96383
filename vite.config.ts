import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from .env files + process.env.
  // Using loadEnv avoids accidentally defining empty strings when process.env
  // is not populated in the preview build environment.
  const env = loadEnv(mode, process.cwd(), "");

  // Lovable Cloud provides backend credentials as env vars.
  // Our client is auto-generated to read VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY.
  // In some environments, only SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY are present.
  // These defines ensure the client always receives required values.
  const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "";
  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY ?? "";

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabaseKey),
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
  };
});
