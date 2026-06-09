import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ALL_TILES, tileLabel, tileUnicode } from '../../efficiency/tiles';
import type { TileId } from '../../types';

interface CorrectionRow {
  index: number;
  id: TileId | null;
}

interface CorrectionPanelProps {
  rows: CorrectionRow[];
  onCorrect: (index: number, tileId: TileId) => void;
}

function TilePicker({ onSelect }: { onSelect: (tileId: TileId) => void }) {
  return (
    <ScrollArea className="h-72">
      <div className="grid grid-cols-6 gap-1 p-1">
        {ALL_TILES.map((tile) => (
          <Button
            key={tile}
            variant="outline"
            size="sm"
            className="font-mono text-xs"
            onClick={() => onSelect(tile)}
          >
            {tileUnicode(tile)} {tileLabel(tile)}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}

export function CorrectionPanel({ rows, onCorrect }: CorrectionPanelProps) {
  if (rows.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">手動補正</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">スロットをタップして牌を選択</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((row) => (
            <Dialog key={row.index}>
              <DialogTrigger
                className={
                  'h-7 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all' +
                  (row.id
                    ? ' bg-primary text-primary-foreground hover:bg-primary/80'
                    : ' border border-yellow-500 text-yellow-500 hover:text-yellow-400')
                }
              >
                {row.id ? tileLabel(row.id) : `#${row.index + 1} ?`}
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>スロット #{row.index + 1} の牌を選択</DialogTitle>
                </DialogHeader>
                <TilePicker onSelect={(tileId) => onCorrect(row.index, tileId)} />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
