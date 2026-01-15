import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ENV, initializeEnvironment } from '@/config/environment';
import { log } from '@/lib/log';

// Validate environment before rendering - crashes if production uses test Stripe keys
try {
  initializeEnvironment();
  log.info('[ENV] Runtime environment resolved:', {
    environment: ENV.environment,
    native: ENV.isNativeApp,
    debugLogs: ENV.enableDebugLogs,
    sourceMaps: ENV.enableSourceMaps,
  });
} catch (error) {
  log.error('Environment validation failed:', error);
  if (window.location.hostname !== 'localhost') {
    throw error;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
