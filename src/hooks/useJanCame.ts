import { useCallback, useEffect, useRef, useState } from 'react';
import { bindVisibilityPause, FrameCapture } from '../camera/index.js';
import type { EfficiencyCalculator } from '../efficiency/index.js';
import { initEfficiencyEngine } from '../efficiency/index.js';
import type { InputMode } from '../input/frame-source.js';
import { InputManager } from '../input/index.js';
import type { OpenCvModule } from '../recognition/opencv.d.js';
import { loadOpenCv } from '../recognition/opencv-loader.js';
import { MATCH_THRESHOLD, runRecognitionPipeline } from '../recognition/pipeline.js';
import { defaultRoiQuad } from '../recognition/roi.js';
import type { TileTemplate } from '../recognition/templates.js';
import { loadTileTemplates } from '../recognition/templates.js';
import { RecognitionWorkerClient } from '../recognition/worker-client.js';
import type { EfficiencyResult, RecognitionResult, RoiQuad, TileId } from '../types/index.js';
import { OverlayRenderer } from '../ui/canvas.js';
import { isDebugMode } from '../util/debug-mode.js';

export interface RecognitionMetrics {
  lastFrameMs: number;
  recognizedCount: number;
  totalSlots: number;
  pipeline: 'worker' | 'main';
}

export interface JanCameState {
  inputMode: InputMode;
  inputFileName: string | null;
  cameraEnabled: boolean;
  recognitionEnabled: boolean;
  loading: boolean;
  loadingMessage: string;
  cameraError: string | null;
  offline: boolean;
  recognition: RecognitionResult | null;
  efficiency: EfficiencyResult | null;
  efficiencyError: string | null;
  debugMetrics: RecognitionMetrics | null;
  controlsEnabled: boolean;
}

export interface JanCameActions {
  setCameraEnabled: (enabled: boolean) => void;
  setRecognitionEnabled: (enabled: boolean) => void;
  selectImage: (file: File) => void;
  clearImage: () => void;
  correctTile: (index: number, tileId: TileId) => void;
  retryCamera: () => void;
  setRoiQuad: (quad: RoiQuad) => void;
}

function mergePinnedTiles(
  result: RecognitionResult,
  pinnedSlots: Map<number, TileId>,
): RecognitionResult {
  return {
    ...result,
    tiles: result.tiles.map((tile, index) => {
      const pinned = pinnedSlots.get(index);
      if (!pinned) return tile;
      return { ...tile, id: pinned, confidence: 1 };
    }),
  };
}

function tilesForEfficiency(result: RecognitionResult): TileId[] {
  return result.tiles.map((tile) => tile.id).filter((id): id is TileId => id !== null);
}

const initialState: JanCameState = {
  inputMode: 'camera',
  inputFileName: null,
  cameraEnabled: false,
  recognitionEnabled: true,
  loading: true,
  loadingMessage: 'OpenCV.js を読み込み中...',
  cameraError: null,
  offline: !navigator.onLine,
  recognition: null,
  efficiency: null,
  efficiencyError: null,
  debugMetrics: null,
  controlsEnabled: false,
};

export function useJanCame(): {
  state: JanCameState;
  actions: JanCameActions;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  previewCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  overlayCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  roiContainerRef: React.RefObject<HTMLDivElement | null>;
} {
  const [state, setState] = useState<JanCameState>(initialState);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const roiContainerRef = useRef<HTMLDivElement | null>(null);

  const inputManagerRef = useRef<InputManager | null>(null);
  const overlayRef = useRef<OverlayRenderer | null>(null);
  const frameCaptureRef = useRef<FrameCapture | null>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionWorkerRef = useRef<RecognitionWorkerClient | null>(null);
  const cvModuleRef = useRef<OpenCvModule | null>(null);
  const templatesRef = useRef<TileTemplate[]>([]);
  const efficiencyRef = useRef<EfficiencyCalculator | null>(null);
  const pinnedSlotsRef = useRef<Map<number, TileId>>(new Map());
  const roiQuadRef = useRef<RoiQuad>(defaultRoiQuad(1280, 720));
  const latestRecognitionRef = useRef<RecognitionResult | null>(null);
  const useWorkerRef = useRef(false);
  const visibilityCleanupRef = useRef<(() => void) | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const updateState = useCallback((partial: Partial<JanCameState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const applyRecognitionResult = useCallback(
    (result: RecognitionResult, timingMs?: number, pipeline?: 'worker' | 'main') => {
      const merged = mergePinnedTiles(result, pinnedSlotsRef.current);
      latestRecognitionRef.current = merged;
      const manualTiles = tilesForEfficiency(merged);
      updateState({ recognition: merged });

      if (manualTiles.length >= 1 && efficiencyRef.current) {
        try {
          const effResult = efficiencyRef.current(manualTiles);
          updateState({ efficiency: effResult, efficiencyError: null });
          overlayRef.current?.setEfficiency(effResult);
        } catch (error) {
          const message = error instanceof Error ? error.message : '牌効率計算エラー';
          updateState({ efficiency: null, efficiencyError: message });
          overlayRef.current?.setEfficiency(null);
        }
      }

      overlayRef.current?.setRecognition(merged);

      if (isDebugMode() && timingMs !== undefined) {
        const recognizedCount = merged.tiles.filter(
          (t) => t.id !== null && t.confidence >= MATCH_THRESHOLD,
        ).length;
        updateState({
          debugMetrics: {
            lastFrameMs: timingMs,
            recognizedCount,
            totalSlots: merged.tiles.length,
            pipeline: pipeline ?? (useWorkerRef.current ? 'worker' : 'main'),
          },
        });
      }
    },
    [updateState],
  );

  const processFrame = useCallback(
    (imageData: ImageData) => {
      const frameId = frameCaptureRef.current?.getFrameId() ?? 0;

      if (useWorkerRef.current && recognitionWorkerRef.current?.isReady()) {
        recognitionWorkerRef.current.submitFrame(frameId, imageData, roiQuadRef.current);
        return;
      }

      const started = performance.now();
      const result = runRecognitionPipeline(imageData, {
        cv: cvModuleRef.current,
        templates: templatesRef.current,
        quad: roiQuadRef.current,
        frameId,
      });
      applyRecognitionResult(result, performance.now() - started, 'main');
    },
    [applyRecognitionResult],
  );

  const setupFrameCapture = useCallback(() => {
    frameCaptureRef.current?.stop();
    if (!inputManagerRef.current) return;

    const canvas = captureCanvasRef.current ?? document.createElement('canvas');
    captureCanvasRef.current = canvas;

    frameCaptureRef.current = new FrameCapture({
      source: inputManagerRef.current.getActiveSource(),
      canvas,
      previewCanvas: previewCanvasRef.current ?? undefined,
      fps: 3,
      shouldCapture: () =>
        stateRef.current.recognitionEnabled && inputManagerRef.current!.getActiveSource().isReady(),
      onFrame: (imageData) => {
        processFrameRef.current(imageData);
      },
    });
    visibilityCleanupRef.current = bindVisibilityPause(frameCaptureRef.current);
    if (stateRef.current.recognitionEnabled) {
      frameCaptureRef.current.start();
    }
  }, []);

  const handleCameraToggle = useCallback(
    async (enabled: boolean) => {
      if (!inputManagerRef.current) return;
      updateState({ cameraError: null });
      try {
        await inputManagerRef.current.setCameraEnabled(enabled);
        if (inputManagerRef.current.getMode() === 'camera') {
          setupFrameCapture();
        }
        updateState({ cameraEnabled: enabled });
      } catch (error) {
        updateState({
          cameraEnabled: false,
          cameraError: inputManagerRef.current.camera.getCameraErrorMessage(error),
        });
      }
    },
    [updateState, setupFrameCapture],
  );

  const handleImageSelected = useCallback(
    async (file: File) => {
      if (!inputManagerRef.current) return;
      updateState({ cameraError: null });
      try {
        await inputManagerRef.current.loadImageFile(file);
        setupFrameCapture();
        frameCaptureRef.current?.start();
      } catch (error) {
        const message = error instanceof Error ? error.message : '画像の読み込みに失敗しました';
        updateState({ cameraError: message });
      }
    },
    [updateState, setupFrameCapture],
  );

  const handleImageClear = useCallback(async () => {
    if (!inputManagerRef.current) return;
    await inputManagerRef.current.clearImage();
    setupFrameCapture();
  }, [setupFrameCapture]);

  const processFrameRef = useRef(processFrame);
  processFrameRef.current = processFrame;
  const setupFrameCaptureRef = useRef(setupFrameCapture);
  setupFrameCaptureRef.current = setupFrameCapture;
  const updateStateRef = useRef(updateState);
  updateStateRef.current = updateState;
  const applyRecognitionResultRef = useRef(applyRecognitionResult);
  applyRecognitionResultRef.current = applyRecognitionResult;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const inputManager = new InputManager(video);
    inputManagerRef.current = inputManager;

    inputManager.onChange((mode, fileName) => {
      updateStateRef.current({ inputMode: mode, inputFileName: fileName });
    });

    const overlay = new OverlayRenderer({
      canvas: overlayCanvasRef.current!,
      getDimensions: () => inputManager.getActiveSource().getDimensions(),
    });
    overlayRef.current = overlay;

    roiQuadRef.current = defaultRoiQuad(1280, 720);

    const efficiency = initEfficiencyEngine();
    efficiencyRef.current = efficiency;

    const recognitionWorker = new RecognitionWorkerClient({
      onResult: (_frameId, result, timingMs) => {
        applyRecognitionResultRef.current(result, timingMs, 'worker');
      },
      onError: (message) => {
        console.warn('[JanCame]', message);
      },
      onProgress: (message) => {
        updateStateRef.current({ loadingMessage: message });
      },
    });
    recognitionWorkerRef.current = recognitionWorker;

    const initApp = async () => {
      updateStateRef.current({ loading: true, loadingMessage: '認識エンジンを初期化中...' });

      try {
        templatesRef.current = await loadTileTemplates();

        useWorkerRef.current = await recognitionWorker.init();
        if (!useWorkerRef.current) {
          updateStateRef.current({ loadingMessage: 'OpenCV.js を読み込み中...' });
          cvModuleRef.current = await loadOpenCv((message) => {
            updateStateRef.current({ loadingMessage: message });
          });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '初期化エラー';
        updateStateRef.current({ loading: false, cameraError: message, controlsEnabled: true });
        return;
      }

      updateStateRef.current({ loading: false, controlsEnabled: true });

      try {
        await inputManager.camera.start();
        roiQuadRef.current = defaultRoiQuad(1280, 720);
        setupFrameCaptureRef.current();
        updateStateRef.current({ cameraEnabled: true });
      } catch (error) {
        const message = inputManager.camera.getCameraErrorMessage(error);
        updateStateRef.current({ cameraError: message, cameraEnabled: false });
      }

      updateStateRef.current({ offline: !navigator.onLine });
    };

    void initApp();

    const onlineHandler = () => updateStateRef.current({ offline: false });
    const offlineHandler = () => updateStateRef.current({ offline: true });
    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
      recognitionWorker.terminate();
      frameCaptureRef.current?.stop();
      visibilityCleanupRef.current?.();
      inputManager.camera.stop();
    };
  }, []);

  useEffect(() => {
    let running = true;

    function renderLoop() {
      if (!running) return;

      const img = inputManagerRef.current?.getActiveSource();
      if (img?.isReady()) {
        const { width, height } = img.getDimensions();
        if (width > 0 && height > 0) {
          overlayRef.current?.render(width, height);
        }
      }

      requestAnimationFrame(renderLoop);
    }

    const rafId = requestAnimationFrame(renderLoop);

    function handleResize() {
      const img = inputManagerRef.current?.getActiveSource();
      if (img?.isReady()) {
        const { width, height } = img.getDimensions();
        if (width > 0 && height > 0) {
          overlayRef.current?.render(width, height);
        }
      }
    }

    window.addEventListener('resize', handleResize);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const actions: JanCameActions = {
    setCameraEnabled: handleCameraToggle,
    setRecognitionEnabled: (enabled) => {
      updateState({ recognitionEnabled: enabled });
      if (enabled) {
        frameCaptureRef.current?.start();
      } else {
        frameCaptureRef.current?.stop();
      }
    },
    selectImage: handleImageSelected,
    clearImage: handleImageClear,
    correctTile: (index, tileId) => {
      pinnedSlotsRef.current.set(index, tileId);
      const latest = latestRecognitionRef.current;
      if (latest) {
        const merged = mergePinnedTiles(latest, pinnedSlotsRef.current);
        latestRecognitionRef.current = merged;
        applyRecognitionResult(
          { ...merged, timestamp: latest.timestamp, frameId: latest.frameId },
          undefined,
        );
      }
    },
    retryCamera: () => {
      void handleCameraToggle(true);
    },
    setRoiQuad: (quad) => {
      roiQuadRef.current = quad;
      overlayRef.current?.setRoiQuad(quad);
    },
  };

  return {
    state,
    actions,
    videoRef,
    previewCanvasRef,
    overlayCanvasRef,
    roiContainerRef,
  };
}
