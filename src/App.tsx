import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { PlanProvider } from "./lib/plan/PlanContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { DowngradeHelper } from "./components/DowngradeHelper";
import { AdminRoute } from "./components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import PetDetails from "./pages/PetDetails";
import Reminders from "./pages/Reminders";
import FoundPet from "./pages/FoundPet";
import PublicPetProfile from "./pages/PublicPetProfile";
import AdminDashboard from "./pages/AdminDashboard";
import PlanDebug from "./pages/admin/PlanDebug";
import HelpCentre from "./pages/HelpCentre";
import Contact from "./pages/Contact";
import LostPetGuide from "./pages/LostPetGuide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import About from "./pages/About";
import Terms from "./pages/Terms";
import SubscriptionTerms from "./pages/SubscriptionTerms";
import RefundsPolicy from "./pages/RefundsPolicy";
import AustralianPrivacy from "./pages/AustralianPrivacy";
import DataHandling from "./pages/DataHandling";
import AppDownloads from "./pages/AppDownloads";
import SmartRecoveryTags from "./pages/SmartRecoveryTags";
import BillingSettings from "./pages/settings/BillingSettings";

import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import AcceptInvite from "./pages/invite/AcceptInvite";
import InviteStatus from "./pages/InviteStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <PlanProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ProfileSetupDialog />
            <DowngradeHelper />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/found/:publicId" element={<FoundPet />} />
              <Route path="/pet/:publicId" element={<PublicPetProfile />} />
              <Route path="/help" element={<HelpCentre />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/lost-pet-guide" element={<LostPetGuide />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/subscription-terms" element={<SubscriptionTerms />} />
              <Route path="/refunds" element={<RefundsPolicy />} />
              <Route path="/privacy-australia" element={<AustralianPrivacy />} />
              <Route path="/data-handling" element={<DataHandling />} />
              <Route path="/downloads" element={<AppDownloads />} />
              <Route path="/smart-tags" element={<SmartRecoveryTags />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/admin/plan-debug" 
                element={
                  <AdminRoute>
                    <PlanDebug />
                  </AdminRoute>
                } 
              />
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
              <Route 
                path="/pets/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EditPet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reminders" 
                element={
                  <ProtectedRoute>
                    <Reminders />
                  </ProtectedRoute>
                } 
              />
              <Route path="/pricing" element={<Pricing />} />
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                } 
              />
              <Route path="/invite/accept" element={<AcceptInvite />} />
              <Route 
                path="/invite/status" 
                element={
                  <ProtectedRoute>
                    <InviteStatus />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings/billing" 
                element={
                  <ProtectedRoute>
                    <BillingSettings />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PlanProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
