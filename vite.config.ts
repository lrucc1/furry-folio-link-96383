import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

/**
 * Read the project_id from supabase/config.toml as a last-resort fallback.
 * This is a public identifier (not a secret).
 */
function readProjectIdFromConfig(): string {
  try {
    const toml = fs.readFileSync(path.resolve(__dirname, "supabase/config.toml"), "utf-8");
    const match = toml.match(/^project_id\s*=\s*"([^"]+)"/m);
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

/**
 * Derive the Supabase anon key from project ref stored in config.toml.
 * The anon key is a publishable key (safe for client-side use).
 * It is NOT a secret — RLS policies protect data, not this key.
 * This map acts as a last-resort fallback when .env is unavailable.
 */
const KNOWN_ANON_KEYS: Record<string, string> = {
  yyuvupjbvjpbouxuzdye:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5dXZ1cGpidmpwYm91eHV6ZHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NTg0MDEsImV4cCI6MjA3NTIzNDQwMX0.Q5DdI1MOkVTxMa5tMbPtE97kNCnxjKm3AEr7wep98xg",
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env from .env files. loadEnv reads .env* files but NOT process.env
  // directly, so we also check process.env for platform-injected variables.
  const env = loadEnv(mode, process.cwd(), "");

  // Resolve Supabase credentials from multiple possible sources.
  // Lovable Cloud may inject VITE_SUPABASE_URL or SUPABASE_URL (and key variants).
  // We check both loadEnv result AND process.env to cover all deployment scenarios.
  const projectId =
    env.VITE_SUPABASE_PROJECT_ID ||
    process.env.VITE_SUPABASE_PROJECT_ID ||
    readProjectIdFromConfig();

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

  let supabaseKey =
    env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    "";

  // Last-resort fallback: use known anon key for this project
  if (!supabaseKey && projectId && KNOWN_ANON_KEYS[projectId]) {
    supabaseKey = KNOWN_ANON_KEYS[projectId];
  }

  // Build define object — always inject if we resolved a value, to ensure
  // import.meta.env has the required configuration at runtime.
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
