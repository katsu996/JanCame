import { useJanCame } from '../../hooks/useJanCame';
import { AppHeader } from './AppHeader';
import { CameraViewport } from './CameraViewport';
import { CorrectionPanel } from './CorrectionPanel';
import { DebugMetricsCard } from './DebugMetricsCard';
import { EfficiencyPanel } from './EfficiencyPanel';
import { OfflineAlert } from './OfflineAlert';

export function App() {
  const { state, actions, videoRef, previewCanvasRef, overlayCanvasRef, roiContainerRef } =
    useJanCame();

  const correctionRows = state.recognition
    ? state.recognition.tiles.map((tile, index) => ({ index, id: tile.id }))
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <OfflineAlert visible={state.offline} />
      <AppHeader
        inputMode={state.inputMode}
        inputFileName={state.inputFileName}
        cameraEnabled={state.cameraEnabled}
        recognitionEnabled={state.recognitionEnabled}
        controlsEnabled={state.controlsEnabled}
        onCameraToggle={actions.setCameraEnabled}
        onRecognitionToggle={actions.setRecognitionEnabled}
        onImageSelect={actions.selectImage}
        onImageClear={actions.clearImage}
      />
      <main className="flex flex-1 flex-col md:flex-row">
        <CameraViewport
          videoRef={videoRef}
          previewCanvasRef={previewCanvasRef}
          overlayCanvasRef={overlayCanvasRef}
          roiContainerRef={roiContainerRef}
          cameraEnabled={state.cameraEnabled}
          loading={state.loading}
          loadingMessage={state.loadingMessage}
          cameraError={state.cameraError}
          onRetryCamera={actions.retryCamera}
          setRoiQuad={actions.setRoiQuad}
        />
        <aside className="border-t border-border bg-muted/30 p-4 md:w-96 md:border-t-0 md:border-l">
          <div className="space-y-4">
            <DebugMetricsCard metrics={state.debugMetrics} />
            <EfficiencyPanel result={state.efficiency} error={state.efficiencyError} />
            <CorrectionPanel rows={correctionRows} onCorrect={actions.correctTile} />
          </div>
        </aside>
      </main>
    </div>
  );
}
