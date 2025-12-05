import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

export function AppLoadingScreen() {
  const isNative = useIsNativeApp();

  // Native app shows gradient to match auth screen
  if (isNative) {
    return (
      <div 
        className="fixed inset-0 flex flex-col items-center justify-center gap-6"
        style={{ 
          background: 'linear-gradient(135deg, hsl(175 60% 45%) 0%, hsl(15 85% 65%) 100%)',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <Logo iconClassName="w-16 h-16" textClassName="text-2xl font-bold text-white" />
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  // Web shows standard background
  return (
    <div 
      className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6"
      style={{ 
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Logo iconClassName="w-16 h-16" textClassName="text-2xl font-bold" />
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
