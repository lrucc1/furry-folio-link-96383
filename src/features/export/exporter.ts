import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/log';

export interface ExportData {
  profile: any;
  memberships: any[];
  pets: any[];
  vaccinations: any[];
  health_reminders: any[];
  pet_documents: any[];
  pet_invites?: any[];
  notifications: any[];
  exported_at: string;
}

/**
 * Export all user data
 */
export async function exportUserData(): Promise<ExportData> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  log.info('[Exporter] Starting data export for user:', user.id);

  const exportData: ExportData = {
    profile: {},
    memberships: [],
    pets: [],
    vaccinations: [],
    health_reminders: [],
    pet_documents: [],
    notifications: [],
    exported_at: new Date().toISOString()
  };

  // Fetch profile
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    exportData.profile = data || {};
  } catch (error) {
    log.warn('[Exporter] Error fetching profile:', error);
  }

  // Fetch memberships
  try {
    const { data } = await supabase
      .from('pet_memberships')
      .select('*')
      .eq('user_id', user.id);
    exportData.memberships = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching memberships:', error);
  }

  // Fetch pets (owned + shared)
  try {
    const { data } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', user.id);
    exportData.pets = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching pets:', error);
  }

  // Fetch vaccinations
  try {
    const { data } = await supabase
      .from('vaccinations')
      .select('*')
      .eq('user_id', user.id);
    exportData.vaccinations = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching vaccinations:', error);
  }

  // Fetch health reminders
  try {
    const { data } = await supabase
      .from('health_reminders')
      .select('*')
      .eq('user_id', user.id);
    exportData.health_reminders = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching health_reminders:', error);
  }

  // Fetch pet documents
  try {
    const { data } = await supabase
      .from('pet_documents')
      .select('*')
      .eq('user_id', user.id);
    exportData.pet_documents = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching pet_documents:', error);
  }

  // Fetch invites (only if owner)
  try {
    const { data } = await supabase
      .from('pet_invites')
      .select('*')
      .eq('invited_by', user.id);
    exportData.pet_invites = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching pet_invites:', error);
  }

  // Fetch notifications
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id);
    exportData.notifications = data || [];
  } catch (error) {
    log.warn('[Exporter] Error fetching notifications:', error);
  }

  log.info('[Exporter] Export complete:', {
    pets: exportData.pets.length,
    vaccinations: exportData.vaccinations.length,
    memberships: exportData.memberships.length
  });

  return exportData;
}
