import { ImageUp, Power, Scan } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { InputMode } from '../../input/frame-source';

interface AppHeaderProps {
  inputMode: InputMode;
  inputFileName: string | null;
  cameraEnabled: boolean;
  recognitionEnabled: boolean;
  controlsEnabled: boolean;
  onCameraToggle: (enabled: boolean) => void;
  onRecognitionToggle: (enabled: boolean) => void;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
}

export function AppHeader({
  inputMode,
  inputFileName,
  cameraEnabled,
  recognitionEnabled,
  controlsEnabled,
  onCameraToggle,
  onRecognitionToggle,
  onImageSelect,
  onImageClear,
}: AppHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/50 p-3">
      <div className="flex items-center gap-3">
        <h1 className="m-0 text-lg font-bold">JanCame</h1>
        <Badge variant="outline" className="text-xs">
          {inputMode === 'camera' ? '入力: カメラ' : `入力: 画像 (${inputFileName ?? ''})`}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Label className="flex items-center gap-2 text-sm" htmlFor="camera-toggle">
          <Power className="size-3.5" />
          <span>カメラ</span>
          <Switch
            id="camera-toggle"
            checked={cameraEnabled}
            onCheckedChange={onCameraToggle}
            disabled={!controlsEnabled}
          />
        </Label>
        <Label className="flex items-center gap-2 text-sm" htmlFor="recognition-toggle">
          <Scan className="size-3.5" />
          <span>認識</span>
          <Switch
            id="recognition-toggle"
            checked={recognitionEnabled}
            onCheckedChange={onRecognitionToggle}
            disabled={!controlsEnabled}
          />
        </Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!controlsEnabled}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/jpeg,image/png';
              input.hidden = true;
              input.addEventListener('change', () => {
                const file = input.files?.[0];
                if (file) onImageSelect(file);
              });
              input.click();
            }}
          >
            <ImageUp className="size-3.5" />
            画像を選択...
          </Button>
          {inputMode === 'image' && (
            <Button variant="ghost" size="sm" onClick={onImageClear}>
              画像クリア
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
