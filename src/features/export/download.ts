import JSZip from 'jszip';
import { ExportData } from './exporter';
import { generateHTMLExport } from './formatters';
import { log } from '@/lib/log';

/**
 * Download export data as ZIP with HTML report and all documents
 */
export async function downloadExport(data: ExportData): Promise<void> {
  try {
    const zip = new JSZip();
    const filename = `petlinkid-export-${new Date().toISOString().split('T')[0]}.zip`;
    
    // Add HTML report
    const html = generateHTMLExport(data);
    zip.file('PetLinkID-Export.html', html);
    
    // Add all documents if any exist
    if (data.pet_documents && data.pet_documents.length > 0) {
      const documentsFolder = zip.folder('documents');
      
      if (documentsFolder) {
        log.info('[Download] Downloading', data.pet_documents.length, 'documents...');
        
        // Download each document
        const downloadPromises = data.pet_documents.map(async (doc: any) => {
          try {
            const response = await fetch(doc.file_url);
            if (!response.ok) {
              log.warn('[Download] Failed to fetch document:', doc.file_name);
              return;
            }
            
            const blob = await response.blob();
            documentsFolder.file(doc.file_name, blob);
            log.debug('[Download] Added document:', doc.file_name);
          } catch (error) {
            log.warn('[Download] Error downloading document:', doc.file_name, error);
          }
        });
        
        await Promise.all(downloadPromises);
      }
    }
    
    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    log.info('[Download] Export downloaded:', filename);
  } catch (error) {
    log.error('[Download] Error creating export:', error);
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
