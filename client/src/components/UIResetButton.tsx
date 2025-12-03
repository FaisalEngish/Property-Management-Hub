import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useModalManager } from "@/hooks/useModalManager";
import { useAuth } from "@/hooks/useAuth";

export function UIResetButton() {
  const { user } = useAuth();
  const { isStuck, forceCloseAll } = useModalManager();

  // Only show for admin users and when UI is stuck
  if (!user || (user as any)?.role !== 'admin' || !isStuck) {
    return null;
  }

  return (
    <Button
      onClick={forceCloseAll}
      variant="destructive"
      size="sm"
      className="fixed top-4 right-4 z-[9999] shadow-lg animate-pulse"
      title="Force close all modals and reset UI"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      🔄 Force UI Reset
    </Button>
  );
}