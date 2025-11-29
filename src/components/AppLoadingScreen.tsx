import { Loader2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function AppLoadingScreen() {
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
