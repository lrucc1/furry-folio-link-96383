import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PlanProvider } from "./lib/plan/PlanContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ProfileSetupDialog } from "./components/ProfileSetupDialog";
import { DowngradeHelper } from "./components/DowngradeHelper";
import { AdminRoute } from "./components/AdminRoute";
import { IOSAppRouter } from "./components/IOSAppRouter";
import { DevModeToggle } from "./components/DevModeToggle";
import { AppLoadingScreen } from "./components/AppLoadingScreen";
import { useIsNativeApp } from "./hooks/useIsNativeApp";
import { AppleAuthError, initializeAppleAuth, logAppleAuthFailure } from "./lib/appleAuth";
import { RootLayout } from "./components/layout/RootLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import EditPet from "./pages/EditPet";
import PetDetails from "./pages/PetDetails";
import PetWeightTracker from "./pages/PetWeightTracker";
import Reminders from "./pages/Reminders";
import FoundPet from "./pages/FoundPet";
import PublicPetProfile from "./pages/PublicPetProfile";
import AdminDashboard from "./pages/AdminDashboard";
import DeletionHistory from "./pages/admin/DeletionHistory";
import PlanDebug from "./pages/admin/PlanDebug";
import TestEmails from "./pages/admin/TestEmails";
import EmailPreview from "./pages/admin/EmailPreview";
import LimitAudit from "./pages/admin/LimitAudit";
import HelpCentre from "./pages/HelpCentre";
import FAQ from "./pages/FAQ";
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
import Support from "./pages/Support";

import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Account from "./pages/Account";
import BillingSuccess from "./pages/BillingSuccess";
import BillingCancel from "./pages/BillingCancel";
import AcceptInvite from "./pages/invite/AcceptInvite";
import InviteStatus from "./pages/InviteStatus";
import IOSHome from "./pages/ios/IOSHome";
import IOSSettings from "./pages/ios/IOSSettings";
import IOSEditProfile from "./pages/ios/IOSEditProfile";
import IOSPlans from "./pages/ios/IOSPlans";
import IOSSharingSettings from "./pages/ios/IOSSharingSettings";
import IOSPrivacyPolicy from "./pages/ios/IOSPrivacyPolicy";
import IOSTerms from "./pages/ios/IOSTerms";
import IOSSubscriptionTerms from "./pages/ios/IOSSubscriptionTerms";

const queryClient = new QueryClient();

function AppContent() {
  const { loading } = useAuth();
  const isNative = useIsNativeApp();
  const [appleAuthInitAttempt, setAppleAuthInitAttempt] = useState(0);

  // Initialize Apple Auth on iOS native app startup
  useEffect(() => {
    if (isNative) {
      let isCancelled = false;

      const initialize = async () => {
        try {
          await initializeAppleAuth();
        } catch (error) {
          if (isCancelled) return;

          const reason = error instanceof AppleAuthError ? error.reason : 'initialization_failed';
          logAppleAuthFailure(reason, error, { attempt: appleAuthInitAttempt + 1 });

          toast.error('Apple Sign-In is unavailable right now.', {
            description: error instanceof Error ? error.message : 'Retry setup to enable Apple Sign-In on this device.',
            action: {
              label: 'Retry',
              onClick: () => setAppleAuthInitAttempt(attempt => attempt + 1),
            },
          });
        }
      };

      initialize();

      return () => {
        isCancelled = true;
      };
    }
  }, [appleAuthInitAttempt, isNative]);

  // Show loading screen on native while auth initializes
  if (isNative && loading) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <IOSAppRouter>
        <RootLayout>
          <ProfileSetupDialog />
          <DowngradeHelper />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/ios-home"
              element={
                <ProtectedRoute>
                  <IOSHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ios-settings"
              element={
                <ProtectedRoute>
                  <IOSSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/profile"
              element={
                <ProtectedRoute>
                  <IOSEditProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/plans"
              element={
                <ProtectedRoute>
                  <IOSPlans />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/sharing"
              element={
                <ProtectedRoute>
                  <IOSSharingSettings />
                </ProtectedRoute>
              }
            />
            <Route path="/settings/privacy-policy" element={<IOSPrivacyPolicy />} />
            <Route path="/settings/terms" element={<IOSTerms />} />
            <Route path="/settings/subscription-terms" element={<IOSSubscriptionTerms />} />
            <Route path="/found/:publicId" element={<FoundPet />} />
            <Route path="/pet/:publicId" element={<PublicPetProfile />} />
            <Route path="/help" element={<HelpCentre />} />
            <Route path="/faq" element={<FAQ />} />
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
            <Route path="/support" element={<Support />} />
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
              path="/pets/:id/weight"
              element={
                <ProtectedRoute>
                  <PetWeightTracker />
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
            <Route path="/billing/success" element={<BillingSuccess />} />
            <Route path="/billing/cancel" element={<BillingCancel />} />
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
            <Route path="/admin/test-emails" element={<AdminRoute><TestEmails /></AdminRoute>} />
            <Route path="/admin/email-preview" element={<AdminRoute><EmailPreview /></AdminRoute>} />
            <Route path="/admin/limit-audit" element={<AdminRoute><LimitAudit /></AdminRoute>} />
            <Route path="/admin/deletion-history" element={<AdminRoute><DeletionHistory /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RootLayout>
      </IOSAppRouter>
      <DevModeToggle />
    </>
  );
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
