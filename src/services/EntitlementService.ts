import { supabase } from '@/integrations/supabase/client';
import { Tier } from '@/lib/plan/effectivePlan';

export interface Entitlement {
  plan: Tier;
  status: 'active' | 'expired';
  renewal_at: string | null;
}

const CACHE_KEY = 'petlinkid_entitlements_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedEntitlement extends Entitlement {
  cachedAt: number;
}

export class EntitlementService {
  private static instance: EntitlementService;

  private constructor() {}

  static getInstance(): EntitlementService {
    if (!EntitlementService.instance) {
      EntitlementService.instance = new EntitlementService();
    }
    return EntitlementService.instance;
  }

  private getCached(): Entitlement | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedEntitlement = JSON.parse(cached);
      const now = Date.now();
      
      if (now - parsed.cachedAt > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }

      return {
        plan: parsed.plan,
        status: parsed.status,
        renewal_at: parsed.renewal_at,
      };
    } catch {
      return null;
    }
  }

  private setCache(entitlement: Entitlement): void {
    try {
      const cached: CachedEntitlement = {
        ...entitlement,
        cachedAt: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error('Failed to cache entitlements:', error);
    }
  }

  async fetchEntitlements(): Promise<Entitlement> {
    try {
      const { data, error } = await supabase.functions.invoke('get-entitlements');

      if (error) {
        console.error('Entitlements fetch error:', error);
        // Return cached value on error, or default to free
        return this.getCached() || { plan: 'free', status: 'active', renewal_at: null };
      }

      const entitlement: Entitlement = {
        plan: data.plan || 'free',
        status: data.status || 'active',
        renewal_at: data.renewal_at || null,
      };

      this.setCache(entitlement);
      return entitlement;
    } catch (error) {
      console.error('Entitlements service error:', error);
      // Return cached value on error, or default to free
      return this.getCached() || { plan: 'free', status: 'active', renewal_at: null };
    }
  }

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  }
}
