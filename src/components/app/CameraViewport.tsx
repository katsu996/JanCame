import type { RefObject } from 'react';
import type { RoiQuad } from '../../types/index.js';
import { LoadingOverlay } from './LoadingOverlay';

interface CameraViewportProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  previewCanvasRef: RefObject<HTMLCanvasElement | null>;
  overlayCanvasRef: RefObject<HTMLCanvasElement | null>;
  roiContainerRef: RefObject<HTMLDivElement | null>;
  cameraEnabled: boolean;
  loading: boolean;
  loadingMessage: string;
  cameraError: string | null;
  onRetryCamera: () => void;
  setRoiQuad: (quad: RoiQuad) => void;
}

export function CameraViewport({
  videoRef,
  previewCanvasRef,
  overlayCanvasRef,
  roiContainerRef,
  cameraEnabled,
  loading,
  loadingMessage,
  cameraError,
  onRetryCamera,
}: CameraViewportProps) {
  return (
    <section className="relative bg-black">
      <div className="relative aspect-video w-full max-h-[70vh] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 size-full object-cover"
        />
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 size-full object-contain bg-black"
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 size-full object-contain pointer-events-none"
        />
        <div ref={roiContainerRef} className="absolute inset-0 touch-none" />
      </div>

      <LoadingOverlay visible={loading} message={loadingMessage} />

      {cameraError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/75 p-4 text-center">
          <p className="text-destructive-foreground">{cameraError}</p>
          <button
            type="button"
            onClick={onRetryCamera}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground cursor-pointer"
          >
            再試行
          </button>
        </div>
      )}

      {!cameraEnabled && !cameraError && !loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-neutral-950 text-muted-foreground">
          <p>カメラ OFF</p>
          <p className="text-sm text-muted-foreground/60">
            画像を選択するか、カメラを ON にしてください
          </p>
        </div>
      )}
    </section>
  );
}
