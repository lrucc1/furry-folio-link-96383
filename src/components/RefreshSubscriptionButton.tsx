import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

export const RefreshSubscriptionButton = () => {
  const { refreshSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshSubscription();
      toast.success("Subscription status refreshed!");
    } catch (error) {
      toast.error("Failed to refresh subscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRefresh}
      disabled={loading}
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );
};
