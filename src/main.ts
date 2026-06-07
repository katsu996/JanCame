import './style.css';
import { bindVisibilityPause, FrameCapture } from './camera/index.js';
import { CameraError, startCameraStream, stopCameraStream } from './camera/stream.js';
import { calculateEfficiency } from './efficiency/index.js';
import type { OpenCvModule } from './recognition/opencv.d.js';
import { loadOpenCv } from './recognition/opencv-loader.js';
import { runRecognitionPipeline } from './recognition/pipeline.js';
import { defaultRoiQuad } from './recognition/roi.js';
import { loadTileTemplates } from './recognition/templates.js';
import type { EfficiencyResult, RecognitionResult, RoiQuad, TileId } from './types/index.js';
import { OverlayRenderer } from './ui/canvas.js';
import { CorrectionPanel } from './ui/correction.js';
import {
  EfficiencyPanel,
  hideCameraError,
  setLoadingVisible,
  showCameraError,
} from './ui/panel.js';
import { RoiEditor } from './ui/roi-editor.js';

const video = document.querySelector<HTMLVideoElement>('#camera-video')!;
const overlayCanvas = document.querySelector<HTMLCanvasElement>('#overlay-canvas')!;
const panelRoot = document.querySelector<HTMLElement>('#panel')!;
const roiContainer = document.querySelector<HTMLElement>('#roi-editor')!;
const cameraError = document.querySelector<HTMLElement>('#camera-error')!;
const loading = document.querySelector<HTMLElement>('#loading')!;
const recognitionToggle = document.querySelector<HTMLInputElement>('#recognition-toggle')!;

const captureCanvas = document.createElement('canvas');
const efficiencyPanel = new EfficiencyPanel(panelRoot);
const overlay = new OverlayRenderer({ video, canvas: overlayCanvas });

let stream: MediaStream | null = null;
let frameCapture: FrameCapture | null = null;
let cvModule: OpenCvModule | null = null;
const templates = await loadTileTemplates();
let roiQuad: RoiQuad = defaultRoiQuad(1280, 720);
let recognitionEnabled = true;
let latestRecognition: RecognitionResult | null = null;
let latestEfficiency: EfficiencyResult | null = null;
let manualTiles: TileId[] = [];

const correctionHost = document.createElement('section');
correctionHost.className = 'panel-section';
panelRoot.appendChild(correctionHost);

const correctionPanel = new CorrectionPanel(correctionHost, (index, tileId) => {
  if (!latestRecognition) return;
  manualTiles[index] = tileId;
  updateEfficiencyFromManual();
});

function getVideoSize(): { width: number; height: number } {
  return {
    width: video.videoWidth || 1280,
    height: video.videoHeight || 720,
  };
}

const roiEditor = new RoiEditor({
  container: roiContainer,
  getVideoSize,
  initialQuad: roiQuad,
  onChange: (quad) => {
    roiQuad = quad;
    overlay.setRoiQuad(roiQuad);
    overlay.render();
  },
});

async function bootstrap(): Promise<void> {
  // カメラは先に起動し、OpenCV はバックグラウンド読み込み（UI をブロックしない）
  void loadOpenCvInBackground();
  await startCamera();
}

async function loadOpenCvInBackground(): Promise<void> {
  setLoadingVisible(loading, true);
  cvModule = await loadOpenCv((message) => {
    const text = loading.querySelector('p');
    if (text) text.textContent = message;
  });
  setLoadingVisible(loading, false);
}

async function startCamera(): Promise<void> {
  hideCameraError(cameraError);
  stopCameraStream(stream);

  try {
    stream = await startCameraStream({ video });
    const size = getVideoSize();
    roiQuad = defaultRoiQuad(size.width, size.height);
    roiEditor.setQuad(roiQuad);
    overlay.setRoiQuad(roiQuad);

    frameCapture?.stop();
    frameCapture = new FrameCapture({
      video,
      canvas: captureCanvas,
      fps: 3,
      shouldCapture: () => recognitionEnabled,
      onFrame: (imageData) => {
        processFrame(imageData);
      },
    });

    bindVisibilityPause(frameCapture);
    frameCapture.start();
    window.requestAnimationFrame(renderLoop);
  } catch (error) {
    const message = error instanceof CameraError ? error.message : 'カメラの起動に失敗しました';
    showCameraError(cameraError, message, () => {
      void startCamera();
    });
  }
}

function processFrame(imageData: ImageData): void {
  const result = runRecognitionPipeline(imageData, {
    cv: cvModule,
    templates,
    quad: roiQuad,
    frameId: frameCapture?.getFrameId() ?? 0,
  });

  latestRecognition = result;
  manualTiles = result.tiles.map((tile) => tile.id).filter((id): id is TileId => id !== null);

  correctionPanel.render(result.tiles.map((tile, index) => ({ index, id: tile.id })));

  updateEfficiency(manualTiles);
  overlay.setRecognition(result);
}

function updateEfficiency(tiles: TileId[]): void {
  if (tiles.length < 1) {
    latestEfficiency = null;
    efficiencyPanel.render(null);
    overlay.setEfficiency(null);
    return;
  }

  try {
    latestEfficiency = calculateEfficiency(tiles);
    efficiencyPanel.render(latestEfficiency);
    overlay.setEfficiency(latestEfficiency);
  } catch (error) {
    const message = error instanceof Error ? error.message : '牌効率計算エラー';
    efficiencyPanel.render(null, message);
    overlay.setEfficiency(null);
  }
}

function updateEfficiencyFromManual(): void {
  updateEfficiency(manualTiles);
  overlay.render();
}

function renderLoop(): void {
  overlay.render();
  window.requestAnimationFrame(renderLoop);
}

recognitionToggle.addEventListener('change', () => {
  recognitionEnabled = recognitionToggle.checked;
  if (recognitionEnabled) {
    frameCapture?.start();
  } else {
    frameCapture?.stop();
  }
});

window.addEventListener('resize', () => overlay.render());

void bootstrap();
