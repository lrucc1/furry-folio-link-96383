import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ENV, initializeEnvironment } from '@/config/environment';

// Validate environment before rendering - crashes if production uses test Stripe keys
try {
  initializeEnvironment();
  console.log('[ENV] Runtime environment resolved:', {
    environment: ENV.environment,
    native: ENV.isNativeApp,
    debugLogs: ENV.enableDebugLogs,
    sourceMaps: ENV.enableSourceMaps,
  });
} catch (error) {
  console.error('Environment validation failed:', error);
  if (window.location.hostname !== 'localhost') {
    throw error;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
