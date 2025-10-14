import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { au } from '@/lib/auEnglish';

interface UpgradeInlineProps {
  feature: string;
}

export function UpgradeInline({ feature }: UpgradeInlineProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleUpgrade = () => {
    setBusy(true);
    navigate('/pricing');
  };

  return (
    <div className="rounded-xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{au('Premium Feature')}</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {au('This feature is available on')} <strong>{au('Premium')}</strong> {au('plans')}.
          </p>
          <Button 
            onClick={handleUpgrade} 
            disabled={busy}
            size="sm"
            className="gap-2"
          >
            <Crown className="w-4 h-4" />
            {au('Upgrade to Premium')}
          </Button>
        </div>
      </div>
    </div>
  );
}
