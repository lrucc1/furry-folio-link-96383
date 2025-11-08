import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeEnvironment } from '@/config/environment';
import './utils/testPetCreation';

// Validate environment before rendering - crashes if production uses test Stripe keys
try {
  initializeEnvironment();
} catch (error) {
  console.error('Environment validation failed:', error);
  if (window.location.hostname !== 'localhost') {
    throw error;
  }
}

createRoot(document.getElementById("root")!).render(<App />);
