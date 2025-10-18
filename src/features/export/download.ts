import { ExportData } from './exporter';
import { log } from '@/lib/log';

/**
 * Download export data as JSON file
 */
export function downloadExport(data: ExportData): void {
  try {
    const filename = `petlinkid-export-${new Date().toISOString().split('T')[0]}.json`;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    log.info('[Download] Export downloaded:', filename);
  } catch (error) {
    log.error('[Download] Error downloading export:', error);
    throw new Error('Failed to download export');
  }
}

/**
 * Calculate export statistics
 */
export function getExportStats(data: ExportData) {
  return {
    totalRecords: 
      (data.pets?.length || 0) +
      (data.vaccinations?.length || 0) +
      (data.health_reminders?.length || 0) +
      (data.pet_documents?.length || 0) +
      (data.memberships?.length || 0) +
      (data.notifications?.length || 0),
    pets: data.pets?.length || 0,
    vaccinations: data.vaccinations?.length || 0,
    healthReminders: data.health_reminders?.length || 0,
    documents: data.pet_documents?.length || 0,
    memberships: data.memberships?.length || 0,
    estimatedSizeKB: Math.round(JSON.stringify(data).length / 1024)
  };
}
