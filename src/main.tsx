import { createRoot } from 'react-dom/client';
import './index.css';

const root = document.getElementById('root')!;

/**
 * Check if required environment variables are present (presence only, no value logging).
 * Returns true if config looks valid, false otherwise.
 */
function validateEnvPresence(): boolean {
  const hasUrl = Boolean(import.meta.env.VITE_SUPABASE_URL);
  const hasKey = Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
  return hasUrl && hasKey;
}

/**
 * Render a user-friendly configuration error screen.
 * Does NOT expose any secrets or URLs—only shows a diagnostic code.
 */
function renderConfigError() {
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f9fafb;
    color: #374151;
    text-align: center;
    padding: 2rem;
  `;
  container.innerHTML = `
    <div style="max-width: 400px;">
      <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">
        App Temporarily Unavailable
      </h1>
      <p style="color: #6b7280; margin-bottom: 1.5rem;">
        We're experiencing a configuration issue. Please try again later or contact support if the problem persists.
      </p>
      <p style="font-size: 0.75rem; color: #9ca3af;">
        Diagnostic code: ENV_CONFIG_MISSING
      </p>
    </div>
  `;
  root.appendChild(container);
}

/**
 * Bootstrap the application with environment validation.
 * Uses dynamic import to prevent crashes from propagating before we can show an error.
 */
async function bootstrap() {
  // Validate env vars are present before importing App (which imports Supabase client)
  if (!validateEnvPresence()) {
    // eslint-disable-next-line no-console
    console.error('[ENV] Missing required environment variables. Showing error screen.');
    renderConfigError();
    return;
  }

  try {
    // Dynamic import ensures Supabase client isn't evaluated until after validation
    const [{ default: App }, { initializeEnvironment, ENV }, { log }] = await Promise.all([
      import('./App'),
      import('@/config/environment'),
      import('@/lib/log'),
    ]);

    // Full environment validation (Stripe keys, etc.)
    try {
      initializeEnvironment();
      log.info('[ENV] Runtime environment resolved:', {
        environment: ENV.environment,
        native: ENV.isNativeApp,
        debugLogs: ENV.enableDebugLogs,
        sourceMaps: ENV.enableSourceMaps,
      });
    } catch (envError) {
      log.error('Environment validation failed:', envError);
      if (window.location.hostname !== 'localhost') {
        throw envError;
      }
    }

    createRoot(root).render(<App />);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Bootstrap] Failed to load application:', error);
    renderConfigError();
  }
}

bootstrap();
