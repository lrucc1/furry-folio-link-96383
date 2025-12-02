import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fingerprint } from 'lucide-react';

interface BiometricSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnable: () => void;
  biometryName: string;
}

export function BiometricSetupModal({ 
  open, 
  onOpenChange, 
  onEnable, 
  biometryName 
}: BiometricSetupModalProps) {
  const handleEnable = () => {
    onEnable();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">
            Enable {biometryName}?
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in faster next time using {biometryName}. Your credentials are stored securely in your device's keychain.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:flex-col sm:space-x-0 gap-2">
          <Button onClick={handleEnable} className="w-full">
            Enable {biometryName}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
            Not Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
