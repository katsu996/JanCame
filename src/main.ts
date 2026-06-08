import './style.css';
import { bindVisibilityPause, FrameCapture } from './camera/index.js';
import { initEfficiencyEngine } from './efficiency/index.js';
import { InputManager } from './input/index.js';
import type { OpenCvModule } from './recognition/opencv.d.js';
import { loadOpenCv } from './recognition/opencv-loader.js';
import { runRecognitionPipeline } from './recognition/pipeline.js';
import { defaultRoiQuad } from './recognition/roi.js';
import { loadTileTemplates } from './recognition/templates.js';
import { RecognitionWorkerClient } from './recognition/worker-client.js';
import type { RecognitionResult, RoiQuad, TileId } from './types/index.js';
import { OverlayRenderer } from './ui/canvas.js';
import {
  bindHeaderControls,
  setControlsEnabled,
  showOfflineBanner,
  updateInputModeLabel,
} from './ui/controls.js';
import { CorrectionPanel } from './ui/correction.js';
import {
  EfficiencyPanel,
  hideCameraError,
  setLoadingVisible,
  showCameraError,
} from './ui/panel.js';
import { RoiEditor } from './ui/roi-editor.js';

const appRoot = document.querySelector<HTMLElement>('#app')!;
const video = document.querySelector<HTMLVideoElement>('#camera-video')!;
const previewCanvas = document.querySelector<HTMLCanvasElement>('#preview-canvas')!;
const overlayCanvas = document.querySelector<HTMLCanvasElement>('#overlay-canvas')!;
const panelRoot = document.querySelector<HTMLElement>('#panel')!;
const roiContainer = document.querySelector<HTMLElement>('#roi-editor')!;
const cameraError = document.querySelector<HTMLElement>('#camera-error')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const cameraPlaceholder = document.querySelector<HTMLElement>('#camera-placeholder')!;
const cameraToggle = document.querySelector<HTMLInputElement>('#camera-toggle')!;
const recognitionToggle = document.querySelector<HTMLInputElement>('#recognition-toggle')!;
const imageInput = document.querySelector<HTMLInputElement>('#image-input')!;
const clearImageButton = document.querySelector<HTMLButtonElement>('#clear-image-button')!;
const inputModeLabel = document.querySelector<HTMLElement>('#input-mode-label')!;

const captureCanvas = document.createElement('canvas');
const efficiencyPanel = new EfficiencyPanel(panelRoot);
const inputManager = new InputManager(video);
const overlay = new OverlayRenderer({
  canvas: overlayCanvas,
  getDimensions: () => inputManager.getActiveSource().getDimensions(),
});

let frameCapture: FrameCapture | null = null;
let cvModule: OpenCvModule | null = null;
let useRecognitionWorker = false;
const pinnedSlots = new Map<number, TileId>();
const templates = await loadTileTemplates();
let roiQuad: RoiQuad = defaultRoiQuad(1280, 720);
let recognitionEnabled = true;
let controlsEnabled = false;
let latestRecognition: RecognitionResult | null = null;
let manualTiles: TileId[] = [];
const calculateEfficiency = initEfficiencyEngine();

const correctionHost = document.createElement('section');
correctionHost.className = 'panel-section';
panelRoot.appendChild(correctionHost);

const correctionPanel = new CorrectionPanel(correctionHost, (index, tileId) => {
  pinnedSlots.set(index, tileId);
  if (latestRecognition) {
    latestRecognition = mergePinnedTiles(latestRecognition);
    manualTiles = tilesForEfficiency(latestRecognition);
    overlay.setRecognition(latestRecognition);
    correctionPanel.render(
      latestRecognition.tiles.map((tile, tileIndex) => ({ index: tileIndex, id: tile.id })),
    );
  } else {
    manualTiles[index] = tileId;
  }
  updateEfficiencyFromManual();
});

function getFrameSize() {
  return inputManager.getActiveSource().getDimensions();
}

function getViewportSize(): { width: number; height: number } {
  const rect = previewCanvas.getBoundingClientRect();
  return {
    width: rect.width || getFrameSize().width,
    height: rect.height || getFrameSize().height,
  };
}

function updatePlaceholder(): void {
  const source = inputManager.getActiveSource();
  const showPlaceholder = inputManager.getMode() === 'camera' && !inputManager.camera.isEnabled();
  cameraPlaceholder.classList.toggle('hidden', !showPlaceholder || source.isReady());
  previewCanvas.style.visibility = source.isReady() ? 'visible' : 'hidden';
  video.style.display = inputManager.getMode() === 'camera' ? 'block' : 'none';
}

function resetRoiForCurrentFrame(): void {
  const size = getFrameSize();
  roiQuad = defaultRoiQuad(size.width, size.height);
  roiEditor.setQuad(roiQuad);
  overlay.setRoiQuad(roiQuad);
}

const roiEditor = new RoiEditor({
  container: roiContainer,
  getVideoSize: getFrameSize,
  initialQuad: roiQuad,
  onChange: (quad) => {
    roiQuad = quad;
    overlay.setRoiQuad(roiQuad);
    renderViewport();
  },
});

function setupFrameCapture(): void {
  frameCapture?.stop();
  frameCapture = new FrameCapture({
    source: inputManager.getActiveSource(),
    canvas: captureCanvas,
    previewCanvas,
    fps: 3,
    shouldCapture: () => recognitionEnabled && inputManager.getActiveSource().isReady(),
    onFrame: (imageData) => {
      processFrame(imageData);
    },
  });
  bindVisibilityPause(frameCapture);
  if (recognitionEnabled) {
    frameCapture.start();
  }
}

async function bootstrap(): Promise<void> {
  bindHeaderControls({
    cameraToggle,
    recognitionToggle,
    imageInput,
    clearImageButton,
    onCameraToggle: (enabled) => {
      void handleCameraToggle(enabled);
    },
    onRecognitionToggle: (enabled) => {
      recognitionEnabled = enabled;
      if (recognitionEnabled) {
        frameCapture?.start();
      } else {
        frameCapture?.stop();
      }
    },
    onImageSelected: (file) => {
      void handleImageSelected(file);
    },
    onImageClear: () => {
      void handleImageClear();
    },
  });

  inputManager.onChange((mode, fileName) => {
    updateInputModeLabel(inputModeLabel, mode, fileName);
    clearImageButton.hidden = mode !== 'image';
    resetRoiForCurrentFrame();
    setupFrameCapture();
    updatePlaceholder();
    renderViewport();
  });

  window.addEventListener('online', () => showOfflineBanner(appRoot, false));
  window.addEventListener('offline', () => showOfflineBanner(appRoot, true));
  showOfflineBanner(appRoot, !navigator.onLine);

  void initRecognitionEngine();
  await startCameraInput();
  enableControls();
  window.requestAnimationFrame(renderLoop);
}

function enableControls(): void {
  controlsEnabled = true;
  setControlsEnabled(true, [cameraToggle, recognitionToggle, imageInput, clearImageButton]);
}

const recognitionWorker = new RecognitionWorkerClient({
  onResult: (_frameId, result) => {
    applyRecognitionResult(result);
  },
  onError: (message) => {
    console.warn('[JanCame]', message);
  },
  onProgress: (message) => {
    const text = loading.querySelector('p');
    if (text) text.textContent = message;
  },
});

function mergePinnedTiles(result: RecognitionResult): RecognitionResult {
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

function applyRecognitionResult(result: RecognitionResult): void {
  latestRecognition = mergePinnedTiles(result);
  manualTiles = tilesForEfficiency(latestRecognition);
  correctionPanel.render(latestRecognition.tiles.map((tile, index) => ({ index, id: tile.id })));
  updateEfficiency(manualTiles);
  overlay.setRecognition(latestRecognition);
  renderViewport();
}

async function initRecognitionEngine(): Promise<void> {
  setLoadingVisible(loading, true);
  setControlsEnabled(false, [cameraToggle, recognitionToggle, imageInput, clearImageButton]);

  useRecognitionWorker = await recognitionWorker.init();
  if (!useRecognitionWorker) {
    cvModule = await loadOpenCv((message) => {
      const text = loading.querySelector('p');
      if (text) text.textContent = message;
    });
  }

  setLoadingVisible(loading, false);
  if (controlsEnabled) {
    setControlsEnabled(true, [cameraToggle, recognitionToggle, imageInput, clearImageButton]);
  }
}

async function startCameraInput(): Promise<void> {
  hideCameraError(cameraError);
  try {
    await inputManager.camera.start();
    resetRoiForCurrentFrame();
    setupFrameCapture();
    updatePlaceholder();
  } catch (error) {
    const message = inputManager.camera.getCameraErrorMessage(error);
    showCameraError(cameraError, message, () => {
      void startCameraInput();
    });
  }
}

async function handleCameraToggle(enabled: boolean): Promise<void> {
  hideCameraError(cameraError);
  try {
    await inputManager.setCameraEnabled(enabled);
    if (inputManager.getMode() === 'camera') {
      setupFrameCapture();
    }
    updatePlaceholder();
    renderViewport();
  } catch (error) {
    cameraToggle.checked = false;
    showCameraError(cameraError, inputManager.camera.getCameraErrorMessage(error), () => {
      cameraToggle.checked = true;
      void handleCameraToggle(true);
    });
  }
}

async function handleImageSelected(file: File): Promise<void> {
  hideCameraError(cameraError);
  try {
    await inputManager.loadImageFile(file);
    resetRoiForCurrentFrame();
    if (recognitionEnabled) {
      frameCapture?.start();
    }
    updatePlaceholder();
    renderViewport();
  } catch (error) {
    const message = error instanceof Error ? error.message : '画像の読み込みに失敗しました';
    showCameraError(cameraError, message, () => undefined);
  }
}

async function handleImageClear(): Promise<void> {
  await inputManager.clearImage();
  updatePlaceholder();
  renderViewport();
}

function processFrame(imageData: ImageData): void {
  const frameId = frameCapture?.getFrameId() ?? 0;

  if (useRecognitionWorker && recognitionWorker.isReady()) {
    recognitionWorker.submitFrame(frameId, imageData, roiQuad);
    return;
  }

  const result = runRecognitionPipeline(imageData, {
    cv: cvModule,
    templates,
    quad: roiQuad,
    frameId,
  });
  applyRecognitionResult(result);
}

function updateEfficiency(tiles: TileId[]): void {
  if (tiles.length < 1) {
    efficiencyPanel.render(null);
    overlay.setEfficiency(null);
    return;
  }

  try {
    const result = calculateEfficiency(tiles);
    efficiencyPanel.render(result);
    overlay.setEfficiency(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '牌効率計算エラー';
    efficiencyPanel.render(null, message);
    overlay.setEfficiency(null);
  }
}

function updateEfficiencyFromManual(): void {
  updateEfficiency(manualTiles);
  renderViewport();
}

function renderViewport(): void {
  const { width, height } = getViewportSize();
  overlay.render(width, height);
  updatePlaceholder();
}

function renderLoop(): void {
  if (inputManager.getMode() === 'camera' && inputManager.camera.isEnabled()) {
    const source = inputManager.getActiveSource();
    if (source.isReady() && previewCanvas.getContext('2d')) {
      const { width, height } = source.getDimensions();
      if (width > 0 && height > 0) {
        previewCanvas.width = width;
        previewCanvas.height = height;
        source.drawFrame(previewCanvas.getContext('2d')!, width, height);
      }
    }
  }
  renderViewport();
  window.requestAnimationFrame(renderLoop);
}

window.addEventListener('resize', () => renderViewport());

void bootstrap();
