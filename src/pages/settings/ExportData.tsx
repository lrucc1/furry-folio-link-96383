import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';
import { exportUserData } from '@/features/export/exporter';
import { downloadExport, getExportStats } from '@/features/export/download';
import { log } from '@/lib/log';

export function ExportData() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileJson className="w-5 h-5" />
          {au('Export my data')}
        </CardTitle>
        <CardDescription>
          {au('Download all your PetLinkID data in JSON format. This includes your profile, pets, vaccinations, health reminders, documents, and more.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">{au('What\'s included:')}</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{au('Profile information')}</li>
              <li>{au('Pet records and details')}</li>
              <li>{au('Vaccination records')}</li>
              <li>{au('Health reminders')}</li>
              <li>{au('Document metadata')}</li>
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
            {au('Your data will be downloaded as a JSON file to your device. This file contains personal information, so please store it securely.')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
