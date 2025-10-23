import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';
import { exportUserData } from '@/features/export/exporter';
import { downloadExport, getExportStats } from '@/features/export/download';
import { log } from '@/lib/log';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { useNavigate } from 'react-router-dom';

export function ExportData() {
  const [exporting, setExporting] = useState(false);
  const { entitlement, loading } = usePlanV2();
  const navigate = useNavigate();

  const handleExport = async () => {
    if (!entitlement?.export_enabled) {
      toast.error(au('Data export requires Pro plan'));
      return;
    }

    setExporting(true);

    try {
      log.info('[ExportData] Starting export...');
      const data = await exportUserData();
      const stats = getExportStats(data);

      log.info('[ExportData] Export stats:', stats);
      
      downloadExport(data);
      
      toast.success(au('Data exported successfully'), {
        description: `${stats.totalRecords} records exported (${stats.estimatedSizeKB} KB)`
      });
    } catch (error) {
      log.error('[ExportData] Export failed:', error);
      toast.error(au('Failed to export data'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!entitlement?.export_enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            {au('Export my data')}
          </CardTitle>
          <CardDescription>
            {au('Download all your PetLinkID data as an HTML report with all uploaded documents.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 border border-primary/20 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">{au('Pro Feature')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {au('Data export is available on')} <strong>{au('Pro')}</strong> {au('plans')}.
                </p>
                <Button onClick={() => navigate('/pricing')} className="gap-2">
                  <Crown className="w-4 h-4" />
                  {au('Upgrade to Pro')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          {au('Export my data')}
        </CardTitle>
        <CardDescription>
          {au('Download all your PetLinkID data as an HTML report with all uploaded documents. This includes your profile, pets, vaccinations, health reminders, and more.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{au('What\'s included:')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{au('Profile information')}</li>
              <li>{au('Pet records and details (with photos)')}</li>
              <li>{au('Vaccination records')}</li>
              <li>{au('Health reminders')}</li>
              <li>{au('All uploaded documents (original files)')}</li>
              <li>{au('Pet memberships')}</li>
              <li>{au('Invitations (if you\'re the owner)')}</li>
              <li>{au('Notifications')}</li>
            </ul>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {au('Exporting...')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                {au('Export my data')}
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            {au('Your data will be downloaded as a ZIP file containing an HTML report and all your uploaded documents. This file contains personal information, so please store it securely.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
