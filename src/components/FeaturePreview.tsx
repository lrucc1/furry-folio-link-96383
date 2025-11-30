import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, FileText, Image, FileCheck, Upload, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeaturePreviewProps {
  feature: 'documents' | 'smartTags' | 'lostMode';
}

const featureConfig = {
  documents: {
    title: 'Pet Documents',
    description: 'Store and organize all your pet\'s important documents in one secure place',
    icon: FileText,
    benefits: [
      'Upload vaccination certificates',
      'Store vet visit records & prescriptions',
      'Keep medical documents organized',
      'Access anywhere, anytime',
    ],
    sampleItems: [
      { name: 'Vaccination_Certificate_2024.pdf', icon: FileCheck, size: '245 KB' },
      { name: 'Vet_Visit_Notes.jpg', icon: Image, size: '1.2 MB' },
      { name: 'Medical_Records.pdf', icon: FileText, size: '890 KB' },
    ],
    storage: {
      free: '0 MB',
      pro: '200 MB',
    },
  },
  smartTags: {
    title: 'Smart Recovery Tags',
    description: 'QR code tags that help reunite you with your lost pet instantly',
    icon: TrendingUp,
    benefits: [
      'Instant notifications when scanned',
      'GPS location tracking',
      'Public profile with contact info',
      'Lost mode activation',
    ],
    sampleItems: [],
    storage: null,
  },
  lostMode: {
    title: 'Lost Mode',
    description: 'Advanced tools to help find your lost pet quickly',
    icon: TrendingUp,
    benefits: [
      'Public alert on pet profile',
      'Instant notifications',
      'Contact form for finders',
      'Location tracking',
    ],
    sampleItems: [],
    storage: null,
  },
};

export function FeaturePreview({ feature }: FeaturePreviewProps) {
  const config = featureConfig[feature];
  const Icon = config.icon;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/20">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Pro
          </Badge>
        </div>
        <CardDescription className="text-base">
          {config.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Benefits List */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            What You Get
          </h4>
          <ul className="space-y-2">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <FileCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample Items Preview (for documents) */}
        {config.sampleItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Example Documents
            </h4>
            <div className="space-y-2 opacity-50 pointer-events-none">
              {config.sampleItems.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-background/50"
                  >
                    <ItemIcon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.size}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Storage Meter (for documents) */}
        {config.storage && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Storage Included
            </h4>
            <div className="p-4 border rounded-lg bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Pro Plan Storage</span>
                <Badge variant="outline" className="bg-primary/10">
                  {config.storage.pro}
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Free plan: {config.storage.free} • Pro plan: {config.storage.pro}
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-4 border-t">
          <Button className="w-full" size="lg" asChild>
            <Link to="/pricing">
              Upgrade to Pro to Unlock
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Get unlimited access to all premium features
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
