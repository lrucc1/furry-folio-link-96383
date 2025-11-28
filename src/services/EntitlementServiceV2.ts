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

// Cache for user data to prevent repeated queries
interface CacheEntry {
  plan: PlanType;
  usage: UserUsage;
  timestamp: number;
}

const CACHE_DURATION = 30000; // 30 seconds
const cache = new Map<string, CacheEntry>();

export class EntitlementServiceV2 {
  private static instance: EntitlementServiceV2;

  private constructor() {}

  static getInstance(): EntitlementServiceV2 {
    if (!EntitlementServiceV2.instance) {
      EntitlementServiceV2.instance = new EntitlementServiceV2();
    }
    return EntitlementServiceV2.instance;
  }

  private getCached(userId: string): CacheEntry | null {
    const entry = cache.get(userId);
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry;
    }
    return null;
  }

  private setCache(userId: string, plan: PlanType, usage: UserUsage): void {
    cache.set(userId, { plan, usage, timestamp: Date.now() });
  }

  clearCache(userId?: string): void {
    if (userId) {
      cache.delete(userId);
    } else {
      cache.clear();
    }
  }

  async getUserPlan(userId: string): Promise<PlanType> {
    const cached = this.getCached(userId);
    if (cached) return cached.plan;

    const { data, error } = await supabase
      .from('profiles')
      .select('plan_v2')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return 'FREE';
    }

    return (data.plan_v2 as PlanType) || 'FREE';
  }

  async getUserUsage(userId: string): Promise<UserUsage> {
    const cached = this.getCached(userId);
    if (cached) return cached.usage;

    // Fetch all data in parallel with optimized queries
    const [petsResult, remindersResult, storageResult] = await Promise.all([
      supabase
        .from('pets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('health_reminders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', false),
      supabase
        .from('storage_usage')
        .select('total_bytes')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    const usage: UserUsage = {
      pets_count: petsResult.count || 0,
      caregivers_count: 0, // Lazy load only when needed
      reminders_active_count: remindersResult.count || 0,
      storage_used_mb: storageResult.data ? storageResult.data.total_bytes / (1024 * 1024) : 0,
    };

    return usage;
  }

  // Combined fetch for both plan and usage - more efficient
  async getPlanAndUsage(userId: string): Promise<{ plan: PlanType; usage: UserUsage }> {
    const cached = this.getCached(userId);
    if (cached) return { plan: cached.plan, usage: cached.usage };

    const [profileResult, petsResult, remindersResult, storageResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('plan_v2')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('pets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('health_reminders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', false),
      supabase
        .from('storage_usage')
        .select('total_bytes')
        .eq('user_id', userId)
        .maybeSingle(),
    ]);

    const plan = (profileResult.data?.plan_v2 as PlanType) || 'FREE';
    const usage: UserUsage = {
      pets_count: petsResult.count || 0,
      caregivers_count: 0,
      reminders_active_count: remindersResult.count || 0,
      storage_used_mb: storageResult.data ? storageResult.data.total_bytes / (1024 * 1024) : 0,
    };

    this.setCache(userId, plan, usage);
    return { plan, usage };
  }

  async checkEntitlement(
    userId: string,
    feature: keyof PlanEntitlements,
    incrementBy: number = 0
  ): Promise<EntitlementCheck> {
    const { plan, usage } = await this.getPlanAndUsage(userId);
    const entitlements = getEntitlements(plan);

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
    const { plan, usage } = await this.getPlanAndUsage(userId);
    const entitlements = getEntitlements(plan);
    const violations: string[] = [];

    if (entitlements.pets_max !== null && usage.pets_count > entitlements.pets_max) {
      violations.push(`You have ${usage.pets_count} pets, but Free plan allows ${entitlements.pets_max}`);
    }

    if (entitlements.reminders_active_max !== null && usage.reminders_active_count > entitlements.reminders_active_max) {
      violations.push(`You have ${usage.reminders_active_count} active reminders, but Free plan allows ${entitlements.reminders_active_max}`);
    }

    if (usage.storage_used_mb > entitlements.docs_storage_mb) {
      violations.push(`You're using ${usage.storage_used_mb.toFixed(1)}MB, but Free plan allows ${entitlements.docs_storage_mb}MB`);
    }

    return {
      overLimit: violations.length > 0,
      violations,
    };
  }
}
