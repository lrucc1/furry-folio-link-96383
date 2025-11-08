import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";

export default function TestEmails() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    navigate("/");
    return null;
  }

  const handleTestEmails = async () => {
    setTesting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-reminder-emails', {
        body: {}
      });

      if (error) throw error;

      setResult(data);
      toast.success("Email test completed successfully!");
    } catch (error: any) {
      console.error("Error testing emails:", error);
      toast.error(error.message || "Failed to test emails");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Test Reminder Emails</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email System Testing
            </CardTitle>
            <CardDescription>
              Manually trigger the reminder email system to test email delivery and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This will run the same process that executes automatically at 9:00 AM daily:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>Check for health reminders due in 7, 3, and 1 day(s)</li>
                <li>Check for vaccinations due in 7, 3, and 1 day(s)</li>
                <li>Send branded email notifications to users</li>
                <li>Prevent duplicate notifications for the same reminder</li>
                <li>Log all notifications in the database</li>
              </ul>

              <Button
                onClick={handleTestEmails}
                disabled={testing}
                size="lg"
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Email Test...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Trigger Email Send
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <span className="text-green-600">
                        {result.success ? "✓ Success" : "✗ Failed"}
                      </span>
                    </div>
                    {result.results && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Emails Sent:</span>
                          <span>{result.results.emailsSent || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Notifications Created:</span>
                          <span>{result.results.notificationsCreated || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Health Reminders Processed:</span>
                          <span>{result.results.healthReminders || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Vaccinations Processed:</span>
                          <span>{result.results.vaccinations || 0}</span>
                        </div>
                      </>
                    )}
                    {result.message && (
                      <p className="text-muted-foreground mt-4">{result.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Note</h3>
              <p className="text-sm text-blue-800">
                The system automatically prevents duplicate emails. If you run this test multiple times,
                it will only send emails for reminders that haven't been notified yet for the specific
                time period (7, 3, or 1 day before).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
