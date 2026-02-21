import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { EntitlementServiceV2 } from '@/services/EntitlementServiceV2';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanV2 } from '@/hooks/usePlanV2';

export function DowngradeHelper() {
  const { user } = useAuth();
  const { plan, usage, entitlement } = usePlanV2();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [violations, setViolations] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkLimits = async () => {
      if (!user?.id || plan !== 'FREE') return;

      setChecking(true);
      const service = EntitlementServiceV2.getInstance();
      const { overLimit, violations: limitViolations } = await service.isOverLimit(user.id);
      
      if (overLimit) {
        setViolations(limitViolations);
        setOpen(true);
      }
      setChecking(false);
    };

    checkLimits();
  }, [user?.id, plan]);

  if (!entitlement || checking) return null;

  const petsOver = entitlement.pets_max !== null && usage.pets_count > entitlement.pets_max;
  const remindersOver = entitlement.reminders_active_max !== null && usage.reminders_active_count > entitlement.reminders_active_max;
  const storageOver = usage.storage_used_mb > entitlement.docs_storage_mb;

  const isOverLimit = petsOver || remindersOver || storageOver;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-warning" />
            Account Limits Exceeded
          </DialogTitle>
          <DialogDescription>
            Your account exceeds Free plan limits. Choose an option below to continue using PetLinkID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              <div className="font-semibold mb-2">Current usage exceeds Free plan limits:</div>
              <ul className="list-disc list-inside space-y-1">
                {violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold">Free Plan Limits:</h3>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <span>Pets:</span>
                <div className="flex items-center gap-2">
                  <span className={petsOver ? 'text-destructive font-semibold' : ''}>
                    {usage.pets_count} / {entitlement.pets_max ?? '∞'}
                  </span>
                  {petsOver ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Active Reminders:</span>
                <div className="flex items-center gap-2">
                  <span className={remindersOver ? 'text-destructive font-semibold' : ''}>
                    {usage.reminders_active_count} / {entitlement.reminders_active_max ?? '∞'}
                  </span>
                  {remindersOver ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Storage:</span>
                <div className="flex items-center gap-2">
                  <span className={storageOver ? 'text-destructive font-semibold' : ''}>
                    {usage.storage_used_mb.toFixed(1)} / {entitlement.docs_storage_mb} MB
                  </span>
                  {storageOver ? <XCircle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
              </div>
            </div>
          </div>

          {isOverLimit && (
            <Alert>
              <AlertDescription>
                <strong>Editing is currently restricted</strong> until you're within Free plan limits or upgrade to Pro.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 pt-4">
            <Button 
              onClick={() => {
                setOpen(false);
                navigate('/pricing');
              }}
              size="lg"
              className="w-full"
            >
              Upgrade to Pro — A$2.99/month
            </Button>

            <Button
              onClick={() => {
                setOpen(false);
                navigate('/ios-home');
              }}
              variant="outline"
              size="lg"
              className="w-full"
            >
              Manage Limits to Stay on Free
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center pt-2">
            To stay on the Free plan, you'll need to reduce your usage:
            {petsOver && <div>• Delete extra pets (keep 1)</div>}
            {remindersOver && <div>• Complete or delete reminders (keep 2 active)</div>}
            {storageOver && <div>• Delete documents to free up storage</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
