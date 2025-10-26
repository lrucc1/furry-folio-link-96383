import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Crown, ExternalLink } from 'lucide-react';
import { getEnvironmentConfig } from '@/config/environment';

const ENV_CONFIG = getEnvironmentConfig();
import { Button } from '@/components/ui/button';

interface PaidPlanInfoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaidPlanInfoSheet({ open, onOpenChange }: PaidPlanInfoSheetProps) {
  const handleOpenWebsite = () => {
    window.open(ENV_CONFIG.marketingUrl, '_blank');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-primary" />
            <AlertDialogTitle>PetLinkID Pro Plan</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Our Pro plan requires an active subscription linked to your account. Create or manage your subscription at petlinkid.io.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            OK
          </AlertDialogAction>
          <Button variant="outline" onClick={handleOpenWebsite}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Website
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
