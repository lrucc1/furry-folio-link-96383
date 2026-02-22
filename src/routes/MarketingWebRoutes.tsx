import { Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Marketing pages
import Index from "@/pages/Index";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import AppDownloads from "@/pages/AppDownloads";
import SmartRecoveryTags from "@/pages/SmartRecoveryTags";

// Legal pages
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import SubscriptionTerms from "@/pages/SubscriptionTerms";
import RefundsPolicy from "@/pages/RefundsPolicy";
import AustralianPrivacy from "@/pages/AustralianPrivacy";
import DataHandling from "@/pages/DataHandling";

// Support (web version)
import HelpCentre from "@/pages/HelpCentre";
import FAQ from "@/pages/FAQ";
import Contact from "@/pages/Contact";
import LostPetGuide from "@/pages/LostPetGuide";
import Support from "@/pages/Support";

// Public pages (QR tag scans work on web too)
import FoundPet from "@/pages/FoundPet";
import PublicPetProfile from "@/pages/PublicPetProfile";

import ResetPassword from "@/pages/ResetPassword";
import NotFound from "@/pages/NotFound";

// Hidden admin routes (unlisted — admins bookmark /auth directly)
import AuthPage from "@/pages/Auth";
import { AdminRoute } from "@/components/AdminRoute";
import AdminDashboard from "@/pages/AdminDashboard";
import PlanDebug from "@/pages/admin/PlanDebug";
import TestEmails from "@/pages/admin/TestEmails";
import EmailPreview from "@/pages/admin/EmailPreview";
import LimitAudit from "@/pages/admin/LimitAudit";
import DeletionHistory from "@/pages/admin/DeletionHistory";

/**
 * Routes for the petlinkid.io marketing website.
 * Wrapped in Header/Footer layout — no app functionality.
 */
export function MarketingWebRoutes() {
  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/downloads" element={<AppDownloads />} />
          <Route path="/smart-tags" element={<SmartRecoveryTags />} />

          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/subscription-terms" element={<SubscriptionTerms />} />
          <Route path="/refunds" element={<RefundsPolicy />} />
          <Route path="/privacy-australia" element={<AustralianPrivacy />} />
          <Route path="/data-handling" element={<DataHandling />} />

          {/* Support */}
          <Route path="/help" element={<HelpCentre />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lost-pet-guide" element={<LostPetGuide />} />
          <Route path="/support" element={<Support />} />

          {/* Password reset */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public pet pages (QR scans land here on web) */}
          <Route path="/found/:publicToken" element={<FoundPet />} />
          <Route path="/pet/:publicToken" element={<PublicPetProfile />} />

          {/* Hidden admin portal (unlisted — no visible links) */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/plan-debug" element={<AdminRoute><PlanDebug /></AdminRoute>} />
          <Route path="/admin/test-emails" element={<AdminRoute><TestEmails /></AdminRoute>} />
          <Route path="/admin/email-preview" element={<AdminRoute><EmailPreview /></AdminRoute>} />
          <Route path="/admin/limit-audit" element={<AdminRoute><LimitAudit /></AdminRoute>} />
          <Route path="/admin/deletion-history" element={<AdminRoute><DeletionHistory /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
