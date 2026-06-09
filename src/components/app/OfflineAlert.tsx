import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface OfflineAlertProps {
  visible: boolean;
}

export function OfflineAlert({ visible }: OfflineAlertProps) {
  if (!visible) return null;

  return (
    <Alert variant="destructive" className="rounded-none border-0">
      <WifiOff className="size-4" />
      <AlertDescription>
        オフラインです。カメラと OpenCV.js はネットワーク接続が必要です。
      </AlertDescription>
    </Alert>
  );
}
