import { Skeleton } from '@/components/ui/skeleton';

interface LoadingOverlayProps {
  visible: boolean;
  message: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/75">
      <div className="flex items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-yellow-500" />
        <Skeleton className="h-4 w-48" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
