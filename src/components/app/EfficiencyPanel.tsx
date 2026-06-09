import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { tileUnicode } from '../../efficiency/tiles';
import type { EfficiencyResult } from '../../types';

interface EfficiencyPanelProps {
  result: EfficiencyResult | null;
  error: string | null;
}

export function EfficiencyPanel({ result, error }: EfficiencyPanelProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">現在の状態</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : !result ? (
            <p className="text-muted-foreground text-sm">認識待ち...</p>
          ) : (
            <p className="text-2xl font-bold">
              {result.shanten <= 0
                ? `テンパイ${result.shanten < 0 ? '（和了）' : ''}`
                : `${result.shanten}向聴`}
            </p>
          )}
        </CardContent>
      </Card>

      {result && result.candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">何を切る？</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[50vh]">
              {result.candidates.map((candidate, index) => (
                <div key={candidate.tile}>
                  {index > 0 && <Separator />}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xl">
                      {tileUnicode(candidate.tile)} {candidate.tile}
                    </span>
                    <div className="flex flex-1 flex-wrap items-center gap-1">
                      <span className="text-muted-foreground text-xs mr-1">受け入れ:</span>
                      {candidate.ukeireTiles.length > 0 ? (
                        candidate.ukeireTiles.map((t) => (
                          <Badge key={t} variant="outline" className="text-xs">
                            {t}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">なし</span>
                      )}
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {candidate.ukeireCount}枚
                    </Badge>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
