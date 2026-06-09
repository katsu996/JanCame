import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CameraErrorAlertProps {
  message: string;
  onRetry: () => void;
}

export function CameraErrorAlert({ message, onRetry }: CameraErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertDescription className="flex items-center justify-between gap-2">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          再試行
        </Button>
      </AlertDescription>
    </Alert>
  );
}
