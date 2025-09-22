import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import PetDetails from "./pages/PetDetails";
import FoundPet from "./pages/FoundPet";
import HelpCentre from "./pages/HelpCentre";
import Contact from "./pages/Contact";
import LostPetGuide from "./pages/LostPetGuide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Terms from "./pages/Terms";
import AustralianPrivacy from "./pages/AustralianPrivacy";
import AppDownloads from "./pages/AppDownloads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/found/:publicId" element={<FoundPet />} />
            <Route path="/help" element={<HelpCentre />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/lost-pet-guide" element={<LostPetGuide />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy-australia" element={<AustralianPrivacy />} />
            <Route path="/downloads" element={<AppDownloads />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pets/new" 
              element={
                <ProtectedRoute>
                  <AddPet />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/pets/:id" 
              element={
                <ProtectedRoute>
                  <PetDetails />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
