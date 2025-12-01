import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { PageTransition } from '@/components/ios/PageTransition';
import { MobileCard } from '@/components/ios/MobileCard';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Users, Stethoscope, QrCode, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsToggleProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const SettingsToggle = ({ icon, label, description, checked, onCheckedChange }: SettingsToggleProps) => (
  <div className="flex items-start gap-3 p-4">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mt-0.5">
      {icon}
    </div>
    <div className="flex-1">
      <span className="font-medium">{label}</span>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
      {title}
    </h3>
    <MobileCard className="p-0 divide-y divide-border overflow-hidden">
      {children}
    </MobileCard>
  </div>
);

export default function IOSSharingSettings() {
  const navigate = useNavigate();
  
  // Sharing preferences state
  const [emergencyContactAccess, setEmergencyContactAccess] = useState(true);
  const [vetAccess, setVetAccess] = useState(true);
  const [qrVisibility, setQrVisibility] = useState<'full' | 'limited' | 'minimal'>('full');
  const [showLostModeAlert, setShowLostModeAlert] = useState(true);

  const handleToggleChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'emergency':
        setEmergencyContactAccess(value);
        break;
      case 'vet':
        setVetAccess(value);
        break;
      case 'lostAlert':
        setShowLostModeAlert(value);
        break;
    }
    toast.success('Setting updated');
    // TODO: Persist to database when sharing preferences table is added
  };

  const handleQrVisibilityChange = (value: string) => {
    setQrVisibility(value as 'full' | 'limited' | 'minimal');
    toast.success('QR visibility updated');
    // TODO: Persist to database
  };

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Sharing & Privacy" headerRight={headerLeft}>
      <PageTransition>
      <div className="pb-8">
        {/* Emergency Contacts */}
        <SettingsGroup title="Emergency Contacts">
          <SettingsToggle
            icon={<Users className="w-4 h-4" />}
            label="Allow Emergency Contact Access"
            description="Emergency contacts can view your pet profiles and contact information"
            checked={emergencyContactAccess}
            onCheckedChange={(v) => handleToggleChange('emergency', v)}
          />
        </SettingsGroup>

        {/* Vet Access */}
        <SettingsGroup title="Veterinarian Access">
          <SettingsToggle
            icon={<Stethoscope className="w-4 h-4" />}
            label="Allow Vet Access to Records"
            description="Vets you've added can view vaccination and medical records"
            checked={vetAccess}
            onCheckedChange={(v) => handleToggleChange('vet', v)}
          />
        </SettingsGroup>

        {/* QR Code Visibility */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            QR Code Visibility
          </h3>
          <MobileCard>
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-medium">What people see when scanning</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control what information is shown when someone scans your pet's QR code
                  </p>
                </div>
              </div>
              
              <RadioGroup value={qrVisibility} onValueChange={handleQrVisibilityChange} className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <RadioGroupItem value="full" id="full" className="mt-1" />
                  <Label htmlFor="full" className="flex-1 cursor-pointer">
                    <span className="font-medium">Full Details</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Pet name, photo, your contact info, medical alerts
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <RadioGroupItem value="limited" id="limited" className="mt-1" />
                  <Label htmlFor="limited" className="flex-1 cursor-pointer">
                    <span className="font-medium">Limited Info</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Pet name, photo, and phone number only
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                  <RadioGroupItem value="minimal" id="minimal" className="mt-1" />
                  <Label htmlFor="minimal" className="flex-1 cursor-pointer">
                    <span className="font-medium">Minimal</span>
                    <span className="text-xs text-muted-foreground block mt-0.5">
                      Pet name and photo only - contact via app
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </MobileCard>
        </div>

        {/* Lost Mode Settings */}
        <SettingsGroup title="Lost Mode">
          <SettingsToggle
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Show Lost Alert Banner"
            description="Display a prominent 'LOST PET' banner when your pet is marked as lost"
            checked={showLostModeAlert}
            onCheckedChange={(v) => handleToggleChange('lostAlert', v)}
          />
        </SettingsGroup>

        {/* Info Note */}
        <div className="px-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            These settings apply to all your pets. You can override settings for individual pets from their profile page.
          </p>
        </div>
      </div>
      </PageTransition>
    </IOSPageLayout>
  );
}
