import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Mail, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EmailPreview() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("health");

  // AdminRoute handles auth/admin checks - no need for duplicate logic here

  // Sample email HTML for Health Reminder
  const healthReminderHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 32px 48px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; }
    .content { padding: 24px 48px; }
    .greeting { font-size: 18px; font-weight: 600; color: #333333; margin: 0 0 16px; }
    .paragraph { font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0; }
    .details-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; margin: 24px 0; border-radius: 4px; }
    .details-label { font-size: 14px; font-weight: 600; color: #667eea; margin: 0 0 8px; }
    .details-text { font-size: 15px; line-height: 22px; color: #525f7f; margin: 0; }
    .info-box { background-color: #fff9e6; border: 1px solid #ffe066; padding: 16px 20px; margin: 16px 0; border-radius: 6px; }
    .info-text { font-size: 15px; color: #333333; margin: 0; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background-color: #667eea; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3); }
    .footer { padding: 0 48px; text-align: center; border-top: 1px solid #e6ebf1; padding-top: 20px; }
    .footer-text { font-size: 14px; color: #525f7f; margin: 8px 0; }
    .footer-link { color: #667eea; text-decoration: none; }
    .footer-small { font-size: 12px; color: #8898aa; margin: 16px 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐾 Pet Health Reminder</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi Sarah,</p>
      
      <p class="paragraph">
        This is a friendly reminder that <strong>Annual Checkup</strong> for your dog, <strong>Max</strong>, is due <strong>in 3 days</strong>.
      </p>
      
      <div class="details-box">
        <p class="details-label">Details:</p>
        <p class="details-text">Max's yearly health checkup including teeth cleaning and general wellness exam</p>
      </div>
      
      <div class="info-box">
        <p class="info-text"><strong>Due Date:</strong> ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      
      <div class="button-container">
        <a href="https://petlinkid.io/reminders" class="button">View All Reminders</a>
      </div>
      
      <p class="paragraph">
        Log in to your PetLink ID account to manage your reminders and keep your pet's health on track.
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text"><strong>PetLink ID</strong> - Keep your pet's health on track</p>
      <p class="footer-text"><a href="https://petlinkid.io" class="footer-link">petlinkid.io</a></p>
      <p class="footer-small">You're receiving this because you have health reminders enabled for your pets.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Sample email HTML for Vaccination Reminder
  const vaccinationReminderHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { padding: 32px 48px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px 12px 0 0; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: bold; margin: 0; }
    .content { padding: 24px 48px; }
    .greeting { font-size: 18px; font-weight: 600; color: #333333; margin: 0 0 16px; }
    .paragraph { font-size: 16px; line-height: 24px; color: #525f7f; margin: 16px 0; }
    .notes-box { background-color: #f8f9fa; border-left: 4px solid #f5576c; padding: 16px 20px; margin: 24px 0; border-radius: 4px; }
    .notes-label { font-size: 14px; font-weight: 600; color: #f5576c; margin: 0 0 8px; }
    .notes-text { font-size: 15px; line-height: 22px; color: #525f7f; margin: 0; }
    .info-box { background-color: #fff9e6; border: 1px solid #ffe066; padding: 16px 20px; margin: 16px 0; border-radius: 6px; }
    .info-text { font-size: 15px; color: #333333; margin: 0; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background-color: #f5576c; border-radius: 8px; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px; box-shadow: 0 4px 6px rgba(245, 87, 108, 0.3); }
    .footer { padding: 0 48px; text-align: center; border-top: 1px solid #e6ebf1; padding-top: 20px; }
    .footer-text { font-size: 14px; color: #525f7f; margin: 8px 0; }
    .footer-link { color: #f5576c; text-decoration: none; }
    .footer-small { font-size: 12px; color: #8898aa; margin: 16px 0 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💉 Vaccination Reminder</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi Sarah,</p>
      
      <p class="paragraph">
        This is a friendly reminder that the <strong>Rabies Booster</strong> vaccination for your dog, <strong>Max</strong>, is due <strong>in 7 days</strong>.
      </p>
      
      <div class="notes-box">
        <p class="notes-label">Notes:</p>
        <p class="notes-text">Remember to bring Max's vaccination record book. Call ahead to confirm appointment availability.</p>
      </div>
      
      <div class="info-box">
        <p class="info-text"><strong>Due Date:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
      </div>
      
      <div class="button-container">
        <a href="https://petlinkid.io/reminders" class="button">View Vaccination Records</a>
      </div>
      
      <p class="paragraph">
        Keeping vaccinations up to date is crucial for your pet's health and wellbeing. Log in to your PetLink ID account to manage your vaccination records.
      </p>
    </div>
    
    <div class="footer">
      <p class="footer-text"><strong>PetLink ID</strong> - Keep your pet's health on track</p>
      <p class="footer-text"><a href="https://petlinkid.io" class="footer-link">petlinkid.io</a></p>
      <p class="footer-small">You're receiving this because you have vaccination reminders enabled for your pets.</p>
    </div>
  </div>
</body>
</html>
  `;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Email Template Preview</h1>
          <p className="text-muted-foreground">
            Preview how the branded reminder emails will appear to users
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="health">
              <Mail className="mr-2 h-4 w-4" />
              Health Reminder
            </TabsTrigger>
            <TabsTrigger value="vaccination">
              <Mail className="mr-2 h-4 w-4" />
              Vaccination Reminder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle>Health Reminder Email Template</CardTitle>
                <CardDescription>
                  This is what users receive when a health reminder is due in 7, 3, or 1 day(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <iframe
                    srcDoc={healthReminderHTML}
                    className="w-full h-[600px] bg-white rounded border"
                    title="Health Reminder Email Preview"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">📧 Email Details</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>From:</strong> PetLink ID &lt;reminders@petlinkid.io&gt;</p>
                    <p><strong>Subject:</strong> Reminder: [Title] for [Pet Name] is due [in X days/tomorrow]</p>
                    <p><strong>Features:</strong> Branded gradient header (purple), details box, CTA button, responsive design</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vaccination">
            <Card>
              <CardHeader>
                <CardTitle>Vaccination Reminder Email Template</CardTitle>
                <CardDescription>
                  This is what users receive when a vaccination is due in 7, 3, or 1 day(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <iframe
                    srcDoc={vaccinationReminderHTML}
                    className="w-full h-[600px] bg-white rounded border"
                    title="Vaccination Reminder Email Preview"
                  />
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">📧 Email Details</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>From:</strong> PetLink ID &lt;reminders@petlinkid.io&gt;</p>
                    <p><strong>Subject:</strong> Reminder: [Vaccine Name] vaccination for [Pet Name] is due [in X days/tomorrow]</p>
                    <p><strong>Features:</strong> Branded gradient header (pink), notes box, CTA button, responsive design</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate("/admin/test-emails")}>
            <Eye className="mr-2 h-4 w-4" />
            Test Email System
          </Button>
        </div>
      </div>
    </div>
  );
}
