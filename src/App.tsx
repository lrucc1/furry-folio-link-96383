import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PlanProvider } from "./lib/plan/PlanContext";

import { AppLoadingScreen } from "./components/AppLoadingScreen";
import { useIsNativeApp } from "./hooks/useIsNativeApp";
import { NativeAppRoutes } from "./routes/NativeAppRoutes";
import { MarketingWebRoutes } from "./routes/MarketingWebRoutes";

const queryClient = new QueryClient();

function AppContent() {
  const { loading } = useAuth();
  const isNative = useIsNativeApp();

  // Show loading screen on native while auth initializes
  if (isNative && loading) {
    return <AppLoadingScreen />;
  }

  if (isNative) {
    return <NativeAppRoutes />;
  }

  return <MarketingWebRoutes />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlanProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </PlanProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
