import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecognitionMetrics } from '../../hooks/useJanCame';

interface DebugMetricsCardProps {
  metrics: RecognitionMetrics | null;
}

export function DebugMetricsCard({ metrics }: DebugMetricsCardProps) {
  if (!metrics) return null;

  return (
    <Card className="border-yellow-500/30">
      <CardHeader className="py-2">
        <CardTitle className="text-xs text-yellow-500">検証モード (?debug=1)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 py-2 text-xs text-muted-foreground">
        <p>処理時間: {Math.round(metrics.lastFrameMs)} ms</p>
        <p>
          認識: {metrics.recognizedCount}/{metrics.totalSlots}
        </p>
        <p>パイプライン: {metrics.pipeline === 'worker' ? 'Worker' : 'メインスレッド'}</p>
      </CardContent>
    </Card>
  );
}
