import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { au } from '@/lib/auEnglish';

const Support = () => {
  const supportEmail = 'support@petlinkid.io';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {au('Support & Help Centre')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {au('We\'re here to help! Get assistance with your PetLinkID account, technical issues, or general questions.')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Email Support */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {au('Email Support')}
              </CardTitle>
              <CardDescription>
                {au('Get help via email - we respond within 24 hours')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {au('For account issues, billing questions, or general support')}
              </p>
              <Button asChild className="w-full">
                <a href={`mailto:${supportEmail}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  {supportEmail}
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Help Centre */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                {au('Help Centre')}
              </CardTitle>
              <CardDescription>
                {au('Browse articles and guides')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {au('Find answers to common questions and step-by-step guides')}
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/help-centre">
                  <FileText className="w-4 h-4 mr-2" />
                  {au('Visit Help Centre')}
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {au('FAQs')}
              </CardTitle>
              <CardDescription>
                {au('Quick answers to frequent questions')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {au('Common questions about features, billing, and more')}
              </p>
              <Button asChild variant="outline" className="w-full md:w-auto">
                <a href="/faq">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {au('View FAQs')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Pet Recovery */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-strong mb-8">
          <CardHeader>
            <CardTitle className="text-destructive">
              🚨 {au('Lost Your Pet?')}
            </CardTitle>
            <CardDescription>
              {au('If your pet is missing, mark them as lost immediately')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {au('Go to your Dashboard → Select your pet → Mark as Lost. This will display your contact details to anyone who scans your pet\'s QR tag.')}
            </p>
            <Button asChild className="w-full md:w-auto">
              <a href="/dashboard">
                {au('Go to Dashboard')}
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Account & Privacy */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
            <CardHeader>
              <CardTitle>{au('Privacy & Data')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/privacy">
                  {au('Privacy Policy')}
                </a>
              </Button>
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/data-handling">
                  {au('Data Handling')}
                </a>
              </Button>
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/australian-privacy">
                  {au('Australian Privacy Compliance')}
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur border-0 shadow-strong">
            <CardHeader>
              <CardTitle>{au('Legal & Terms')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/terms">
                  {au('Terms of Service')}
                </a>
              </Button>
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/subscription-terms">
                  {au('Subscription Terms')}
                </a>
              </Button>
              <Button asChild variant="link" className="w-full justify-start p-0 h-auto">
                <a href="/refunds-policy">
                  {au('Refunds Policy')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-strong mt-8">
          <CardHeader>
            <CardTitle>{au('Contact Information')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-foreground">{au('PetLinkID by Betametrics Pty Ltd')}</p>
              <p className="text-muted-foreground">Australian owned • Serving customers worldwide</p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <strong>{au('Email:')}</strong> {supportEmail}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <strong>{au('Response Time:')}</strong> Within 24 hours on business days
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

    </div>
  );
};

export default Support;
