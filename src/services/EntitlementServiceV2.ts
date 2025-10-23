import { supabase } from '@/integrations/supabase/client';
import { PLANS, PlanType, PlanEntitlements, getEntitlements } from '@/config/pricing';

export interface UserUsage {
  pets_count: number;
  caregivers_count: number;
  reminders_active_count: number;
  storage_used_mb: number;
}

export interface EntitlementCheck {
  allowed: boolean;
  reason?: string;
  upgrade_required?: boolean;
}

export class EntitlementServiceV2 {
  private static instance: EntitlementServiceV2;

  private constructor() {}

  static getInstance(): EntitlementServiceV2 {
    if (!EntitlementServiceV2.instance) {
      EntitlementServiceV2.instance = new EntitlementServiceV2();
    }
    return EntitlementServiceV2.instance;
  }

  async getUserPlan(userId: string): Promise<PlanType> {
    const { data, error } = await supabase
      .from('profiles')
      .select('plan_v2, trial_end_at, subscription_status')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return 'FREE';
    }

    return (data.plan_v2 as PlanType) || 'FREE';
  }

  async getUserUsage(userId: string): Promise<UserUsage> {
    // Get pet count (owned + shared)
    const { count: petsCount } = await supabase
      .from('pets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get caregivers count (pet memberships for user's pets)
    const { data: userPets } = await supabase
      .from('pets')
      .select('id')
      .eq('user_id', userId);

    const petIds = userPets?.map(p => p.id) || [];
    
    const { count: caregiversCount } = await supabase
      .from('pet_memberships')
      .select('*', { count: 'exact', head: true })
      .in('pet_id', petIds.length > 0 ? petIds : ['']);

    // Get active reminders count
    const { count: remindersCount } = await supabase
      .from('health_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('completed', false);

    // Get storage usage - use maybeSingle to avoid 406 errors if no row exists
    const { data: storageData } = await supabase
      .from('storage_usage')
      .select('total_bytes')
      .eq('user_id', userId)
      .maybeSingle();

    const storageMb = storageData ? storageData.total_bytes / (1024 * 1024) : 0;

    return {
      pets_count: petsCount || 0,
      caregivers_count: caregiversCount || 0,
      reminders_active_count: remindersCount || 0,
      storage_used_mb: storageMb,
    };
  }

  async checkEntitlement(
    userId: string,
    feature: keyof PlanEntitlements,
    incrementBy: number = 0
  ): Promise<EntitlementCheck> {
    const plan = await this.getUserPlan(userId);
    const entitlements = getEntitlements(plan);
    const usage = await this.getUserUsage(userId);

    switch (feature) {
      case 'pets_max': {
        const limit = entitlements.pets_max;
        if (limit === null) return { allowed: true };
        
        const currentCount = usage.pets_count + incrementBy;
        if (currentCount > limit) {
          return {
            allowed: false,
            reason: `Free plan allows maximum ${limit} pet${limit > 1 ? 's' : ''}. Upgrade to Pro for unlimited pets.`,
            upgrade_required: true,
          };
        }
        return { allowed: true };
      }

      case 'reminders_active_max': {
        const limit = entitlements.reminders_active_max;
        if (limit === null) return { allowed: true };
        
        const currentCount = usage.reminders_active_count + incrementBy;
        if (currentCount > limit) {
          return {
            allowed: false,
            reason: `Free plan allows maximum ${limit} active reminders. Upgrade to Pro for unlimited reminders.`,
            upgrade_required: true,
          };
        }
        return { allowed: true };
      }

      case 'docs_storage_mb': {
        const limit = entitlements.docs_storage_mb;
        const currentUsage = usage.storage_used_mb + (incrementBy / (1024 * 1024));
        
        if (currentUsage > limit) {
          return {
            allowed: false,
            reason: `Storage limit exceeded. Free plan allows ${limit}MB. Upgrade to Pro for ${PLANS.PRO.entitlements.docs_storage_mb}MB.`,
            upgrade_required: true,
          };
        }
        return { allowed: true };
      }

      case 'export_enabled': {
        if (!entitlements.export_enabled) {
          return {
            allowed: false,
            reason: 'Data export is a Pro feature. Upgrade to export your pet data.',
            upgrade_required: true,
          };
        }
        return { allowed: true };
      }

      case 'caregivers_readwrite_enabled': {
        if (!entitlements.caregivers_readwrite_enabled) {
          return {
            allowed: false,
            reason: 'Read/write caregiver access is a Pro feature. Free plan allows view-only access.',
            upgrade_required: true,
          };
        }
        return { allowed: true };
      }

      default:
        return { allowed: true };
    }
  }

  async isOverLimit(userId: string): Promise<{
    overLimit: boolean;
    violations: string[];
  }> {
    const plan = await this.getUserPlan(userId);
    const entitlements = getEntitlements(plan);
    const usage = await this.getUserUsage(userId);
    const violations: string[] = [];

    // Check pets
    if (entitlements.pets_max !== null && usage.pets_count > entitlements.pets_max) {
      violations.push(`You have ${usage.pets_count} pets, but Free plan allows ${entitlements.pets_max}`);
    }

    // Check reminders
    if (entitlements.reminders_active_max !== null && usage.reminders_active_count > entitlements.reminders_active_max) {
      violations.push(`You have ${usage.reminders_active_count} active reminders, but Free plan allows ${entitlements.reminders_active_max}`);
    }

    // Check storage
    if (usage.storage_used_mb > entitlements.docs_storage_mb) {
      violations.push(`You're using ${usage.storage_used_mb.toFixed(1)}MB, but Free plan allows ${entitlements.docs_storage_mb}MB`);
    }

    return {
      overLimit: violations.length > 0,
      violations,
    };
  }
}
