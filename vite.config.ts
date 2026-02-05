import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from .env files. loadEnv reads .env* files but NOT process.env
  // directly, so we also check process.env for platform-injected variables.
  const env = loadEnv(mode, process.cwd(), "");

  // Resolve Supabase credentials from multiple possible sources.
  // Lovable Cloud may inject VITE_SUPABASE_URL or SUPABASE_URL (and key variants).
  // We check both loadEnv result AND process.env to cover all deployment scenarios.
  // Also support constructing URL from project ID as a fallback.
  const projectId =
    env.VITE_SUPABASE_PROJECT_ID ||
    process.env.VITE_SUPABASE_PROJECT_ID ||
    "";

  let supabaseUrl =
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  // If URL not found but project ID exists, construct it
  if (!supabaseUrl && projectId) {
    supabaseUrl = `https://${projectId}.supabase.co`;
  }

  const supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";

  // Build define object ONLY for non-empty values to avoid overwriting
  // platform-injected variables with empty strings.
  const define: Record<string, string> = {};
  if (supabaseUrl) {
    define["import.meta.env.VITE_SUPABASE_URL"] = JSON.stringify(supabaseUrl);
  }
  if (supabaseKey) {
    define["import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY"] = JSON.stringify(supabaseKey);
  }

  return {
    define,
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
