import { cn } from '@/lib/utils';

// Base shimmer skeleton with gradient animation
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded-md",
        className
      )}
    />
  );
}

// Pet card skeleton for the horizontal pet selector
export function PetCardSkeleton() {
  return (
    <div className="shrink-0 p-3 rounded-2xl border border-border/50 bg-card">
      <div className="flex flex-col items-center min-w-[80px]">
        <ShimmerSkeleton className="w-14 h-14 rounded-full mb-2" />
        <ShimmerSkeleton className="w-12 h-4 rounded" />
      </div>
    </div>
  );
}

// Feature tile skeleton for the quick actions grid
export function FeatureTileSkeleton() {
  return (
    <div className="p-4 rounded-3xl border border-border/40 bg-card">
      <ShimmerSkeleton className="w-10 h-10 rounded-2xl mb-3" />
      <ShimmerSkeleton className="w-16 h-4 rounded mb-1" />
      <ShimmerSkeleton className="w-12 h-3 rounded" />
    </div>
  );
}

// Settings row skeleton
export function SettingsRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4">
      <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
      <ShimmerSkeleton className="flex-1 h-5 rounded max-w-[150px]" />
      <ShimmerSkeleton className="w-5 h-5 rounded" />
    </div>
  );
}

// Mobile card skeleton
export function MobileCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border/40 bg-card p-4", className)}>
      <div className="flex items-center gap-4">
        <ShimmerSkeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-5 w-32 rounded" />
          <ShimmerSkeleton className="h-4 w-48 rounded" />
        </div>
      </div>
    </div>
  );
}

// Profile header skeleton
export function ProfileHeaderSkeleton() {
  return (
    <div className="rounded-3xl border border-border/40 bg-card p-4">
      <div className="flex items-center gap-4">
        <ShimmerSkeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <ShimmerSkeleton className="h-5 w-24 rounded" />
          <ShimmerSkeleton className="h-4 w-40 rounded" />
          <ShimmerSkeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Settings group skeleton
export function SettingsGroupSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="mb-6">
      <ShimmerSkeleton className="h-3 w-20 rounded mb-2 mx-4" />
      <div className="rounded-3xl border border-border/40 bg-card overflow-hidden divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, i) => (
          <SettingsRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Full IOSHome page skeleton
export function IOSHomeSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome card skeleton */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-6 w-40 rounded" />
            <ShimmerSkeleton className="h-4 w-48 rounded" />
          </div>
          <ShimmerSkeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>

      {/* Pet selector skeleton */}
      <div className="space-y-3">
        <ShimmerSkeleton className="h-4 w-20 rounded mx-1" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <PetCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Feature tiles skeleton */}
      <div className="space-y-3">
        <ShimmerSkeleton className="h-4 w-24 rounded mx-1" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <FeatureTileSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Quick links skeleton */}
      <div className="space-y-3">
        <ShimmerSkeleton className="h-4 w-12 rounded mx-1" />
        <div className="space-y-2">
          <MobileCardSkeleton />
          <MobileCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Full IOSSettings page skeleton
export function IOSSettingsSkeleton() {
  return (
    <div className="pb-8">
      {/* Profile header */}
      <div className="mb-6">
        <ProfileHeaderSkeleton />
      </div>

      {/* Account settings */}
      <SettingsGroupSkeleton rows={3} />

      {/* Notifications */}
      <SettingsGroupSkeleton rows={3} />

      {/* Appearance */}
      <SettingsGroupSkeleton rows={1} />

      {/* Privacy */}
      <SettingsGroupSkeleton rows={4} />
    </div>
  );
}

// IOSEditProfile skeleton
export function IOSEditProfileSkeleton() {
  return (
    <div className="pb-8">
      {/* Profile Photo Card */}
      <div className="rounded-3xl border border-border/40 bg-card p-4 mb-6">
        <div className="flex flex-col items-center py-4">
          <ShimmerSkeleton className="w-24 h-24 rounded-full mb-3" />
          <ShimmerSkeleton className="w-32 h-4 rounded" />
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-36 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          {['Display Name', 'Full Name', 'Email', 'Phone'].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-border/30 last:border-0">
              <ShimmerSkeleton className="w-24 h-4 rounded" />
              <ShimmerSkeleton className="flex-1 h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Location Section */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-20 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          {['Country', 'Timezone'].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 border-b border-border/30 last:border-0">
              <ShimmerSkeleton className="w-20 h-4 rounded" />
              <ShimmerSkeleton className="flex-1 h-10 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// IOSPlans skeleton
export function IOSPlansSkeleton() {
  return (
    <div className="pb-8">
      {/* Current Plan Card */}
      <div className="rounded-3xl border border-border/40 bg-card p-4 mb-6">
        <div className="text-center py-4">
          <ShimmerSkeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
          <ShimmerSkeleton className="w-32 h-6 rounded mx-auto mb-2" />
          <ShimmerSkeleton className="w-20 h-6 rounded-full mx-auto" />
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-36 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center p-4 border-b border-border">
            <ShimmerSkeleton className="flex-1 h-4 w-16 rounded" />
            <div className="flex gap-6">
              <ShimmerSkeleton className="w-16 h-4 rounded" />
              <ShimmerSkeleton className="w-16 h-4 rounded" />
            </div>
          </div>
          {/* Rows */}
          <div className="px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center py-3 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-3 flex-1">
                  <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
                  <ShimmerSkeleton className="w-24 h-4 rounded" />
                </div>
                <div className="flex gap-6">
                  <ShimmerSkeleton className="w-16 h-5 rounded" />
                  <ShimmerSkeleton className="w-16 h-5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="px-4 space-y-3">
        <ShimmerSkeleton className="w-full h-12 rounded-lg" />
        <ShimmerSkeleton className="w-full h-12 rounded-lg" />
      </div>

      {/* Pricing Info */}
      <div className="px-4 mt-6">
        <div className="p-4 bg-muted/30 rounded-xl text-center">
          <ShimmerSkeleton className="w-32 h-8 rounded mx-auto mb-2" />
          <ShimmerSkeleton className="w-24 h-4 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

// IOSSharingSettings skeleton
export function IOSSharingSettingsSkeleton() {
  return (
    <div className="pb-8">
      {/* Emergency Contacts */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-32 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <ShimmerSkeleton className="w-40 h-4 rounded" />
              <ShimmerSkeleton className="w-64 h-3 rounded" />
            </div>
            <ShimmerSkeleton className="w-10 h-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Vet Access */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-32 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <ShimmerSkeleton className="w-40 h-4 rounded" />
              <ShimmerSkeleton className="w-56 h-3 rounded" />
            </div>
            <ShimmerSkeleton className="w-10 h-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* QR Code Visibility */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-32 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card p-4">
          <div className="flex items-start gap-3 mb-4">
            <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <ShimmerSkeleton className="w-48 h-4 rounded" />
              <ShimmerSkeleton className="w-64 h-3 rounded" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <ShimmerSkeleton className="w-4 h-4 rounded-full mt-1" />
                <div className="space-y-1 flex-1">
                  <ShimmerSkeleton className="w-24 h-4 rounded" />
                  <ShimmerSkeleton className="w-48 h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lost Mode */}
      <div className="mb-6">
        <ShimmerSkeleton className="h-3 w-20 rounded mb-2 mx-4" />
        <div className="rounded-3xl border border-border/40 bg-card overflow-hidden">
          <div className="flex items-start gap-3 p-4">
            <ShimmerSkeleton className="w-8 h-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <ShimmerSkeleton className="w-36 h-4 rounded" />
              <ShimmerSkeleton className="w-56 h-3 rounded" />
            </div>
            <ShimmerSkeleton className="w-10 h-6 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
