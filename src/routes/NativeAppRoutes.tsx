import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { ProfileSetupDialog } from "@/components/ProfileSetupDialog";
import { DowngradeHelper } from "@/components/DowngradeHelper";

// Auth
import Auth from "@/pages/Auth";

// iOS App Pages
import IOSHome from "@/pages/ios/IOSHome";
import IOSSettings from "@/pages/ios/IOSSettings";
import IOSEditProfile from "@/pages/ios/IOSEditProfile";
import IOSPlans from "@/pages/ios/IOSPlans";
import IOSSharingSettings from "@/pages/ios/IOSSharingSettings";
import IOSPrivacyPolicy from "@/pages/ios/IOSPrivacyPolicy";
import IOSTerms from "@/pages/ios/IOSTerms";
import IOSSubscriptionTerms from "@/pages/ios/IOSSubscriptionTerms";

// Shared app pages (used by iOS only now)
import PetDetails from "@/pages/PetDetails";
import EditPet from "@/pages/EditPet";
import PetWeightTracker from "@/pages/PetWeightTracker";
import AddPet from "@/pages/AddPet";
import Reminders from "@/pages/Reminders";
import BillingSuccess from "@/pages/BillingSuccess";
import BillingCancel from "@/pages/BillingCancel";
import BillingSettings from "@/pages/settings/BillingSettings";

// Public pages (needed for QR tags)
import FoundPet from "@/pages/FoundPet";
import PublicPetProfile from "@/pages/PublicPetProfile";

// Support pages
import HelpCentre from "@/pages/HelpCentre";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import LostPetGuide from "@/pages/LostPetGuide";
import Support from "@/pages/Support";

// Admin
import AdminDashboard from "@/pages/AdminDashboard";
import DeletionHistory from "@/pages/admin/DeletionHistory";
import PlanDebug from "@/pages/admin/PlanDebug";
import TestEmails from "@/pages/admin/TestEmails";
import EmailPreview from "@/pages/admin/EmailPreview";
import LimitAudit from "@/pages/admin/LimitAudit";

// Invite
import AcceptInvite from "@/pages/invite/AcceptInvite";
import InviteStatus from "@/pages/InviteStatus";

import NotFound from "@/pages/NotFound";

/**
 * Routes for the native iOS app.
 * No Header/Footer — iOS uses IOSPageLayout exclusively.
 */
export function NativeAppRoutes() {
  return (
    <>
      <ProfileSetupDialog />
      <DowngradeHelper />
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* iOS Home & Settings */}
        <Route path="/" element={<ProtectedRoute><IOSHome /></ProtectedRoute>} />
        <Route path="/ios-home" element={<ProtectedRoute><IOSHome /></ProtectedRoute>} />
        <Route path="/ios-settings" element={<ProtectedRoute><IOSSettings /></ProtectedRoute>} />

        {/* Settings sub-pages */}
        <Route path="/settings/profile" element={<ProtectedRoute><IOSEditProfile /></ProtectedRoute>} />
        <Route path="/settings/plans" element={<ProtectedRoute><IOSPlans /></ProtectedRoute>} />
        <Route path="/settings/sharing" element={<ProtectedRoute><IOSSharingSettings /></ProtectedRoute>} />
        <Route path="/settings/billing" element={<ProtectedRoute><BillingSettings /></ProtectedRoute>} />
        <Route path="/settings/privacy-policy" element={<IOSPrivacyPolicy />} />
        <Route path="/settings/terms" element={<IOSTerms />} />
        <Route path="/settings/subscription-terms" element={<IOSSubscriptionTerms />} />

        {/* Pet management */}
        <Route path="/pets/new" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
        <Route path="/pets/:id" element={<ProtectedRoute><PetDetails /></ProtectedRoute>} />
        <Route path="/pets/:id/edit" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
        <Route path="/pets/:id/weight" element={<ProtectedRoute><PetWeightTracker /></ProtectedRoute>} />

        {/* Reminders */}
        <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />

        {/* Billing */}
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/cancel" element={<BillingCancel />} />

        {/* Public pages (QR tags) */}
        <Route path="/found/:publicToken" element={<FoundPet />} />
        <Route path="/pet/:publicToken" element={<PublicPetProfile />} />

        {/* Support */}
        <Route path="/help" element={<HelpCentre />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/lost-pet-guide" element={<LostPetGuide />} />
        <Route path="/support" element={<Support />} />

        {/* Invites */}
        <Route path="/invite/accept" element={<AcceptInvite />} />
        <Route path="/invite/status" element={<ProtectedRoute><InviteStatus /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/plan-debug" element={<AdminRoute><PlanDebug /></AdminRoute>} />
        <Route path="/admin/test-emails" element={<AdminRoute><TestEmails /></AdminRoute>} />
        <Route path="/admin/email-preview" element={<AdminRoute><EmailPreview /></AdminRoute>} />
        <Route path="/admin/limit-audit" element={<AdminRoute><LimitAudit /></AdminRoute>} />
        <Route path="/admin/deletion-history" element={<AdminRoute><DeletionHistory /></AdminRoute>} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
