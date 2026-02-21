import { usePlan } from '@/lib/plan/PlanContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function PlanDebug() {
  const { tier, source, profile, loading, refresh } = usePlan();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate('/ios-home');
    return null;
  }

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Plan data refreshed');
    } catch (error) {
      toast.error('Failed to refresh plan data');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold">Plan Debug Console</h1>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Effective Tier:</span>
                <span className={tier !== 'free' ? 'text-primary font-bold' : 'text-muted-foreground'}>
                  {tier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Source:</span>
                <span>{source}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Loading:</span>
                <span>{loading ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw Profile Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Last Refresh:</span>
                <span className="ml-2 text-muted-foreground">{new Date().toISOString()}</span>
              </div>
              <div>
                <span className="font-medium">Realtime Status:</span>
                <span className="ml-2 text-green-600">Active</span>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  This panel shows the current state of the plan tier system. Changes made in the admin
                  panel should appear here instantly via Realtime updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
