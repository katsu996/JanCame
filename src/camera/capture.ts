import type { FrameCaptureContext } from '../input/frame-source.js';

export interface FrameCaptureOptions {
  source: FrameCaptureContext;
  canvas: HTMLCanvasElement;
  previewCanvas?: HTMLCanvasElement;
  fps?: number;
  onFrame: (imageData: ImageData, timestamp: number) => void;
  shouldCapture?: () => boolean;
}

export class FrameCapture {
  private readonly source: FrameCaptureContext;
  private readonly canvas: HTMLCanvasElement;
  private readonly previewCanvas: HTMLCanvasElement | null;
  private readonly context: CanvasRenderingContext2D;
  private readonly previewContext: CanvasRenderingContext2D | null;
  private readonly onFrame: (imageData: ImageData, timestamp: number) => void;
  private readonly intervalMs: number;
  private readonly shouldCapture: () => boolean;
  private timerId: number | null = null;
  private frameId = 0;

  constructor(options: FrameCaptureOptions) {
    this.source = options.source;
    this.canvas = options.canvas;
    this.previewCanvas = options.previewCanvas ?? null;
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }
    this.context = context;
    this.previewContext = this.previewCanvas?.getContext('2d') ?? null;
    this.onFrame = options.onFrame;
    this.intervalMs = 1000 / (options.fps ?? 3);
    this.shouldCapture = options.shouldCapture ?? (() => true);
  }

  start(): void {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => this.captureFrame(), this.intervalMs);
  }

  stop(): void {
    if (this.timerId === null) return;
    window.clearInterval(this.timerId);
    this.timerId = null;
  }

  private captureFrame(): void {
    if (!this.shouldCapture()) return;
    if (document.visibilityState === 'hidden') return;
    if (!this.source.isReady()) return;

    const { width, height } = this.source.getDimensions();
    if (width === 0 || height === 0) return;

    this.canvas.width = width;
    this.canvas.height = height;
    if (!this.source.drawFrame(this.context, width, height)) return;

    if (this.previewCanvas && this.previewContext) {
      this.previewCanvas.width = width;
      this.previewCanvas.height = height;
      this.previewContext.drawImage(this.canvas, 0, 0);
    }

    const imageData = this.context.getImageData(0, 0, width, height);
    this.frameId++;
    this.onFrame(imageData, performance.now());
  }

  getFrameId(): number {
    return this.frameId;
  }
}

export function bindVisibilityPause(capture: FrameCapture): () => void {
  const handler = (): void => {
    if (document.visibilityState === 'hidden') {
      capture.stop();
    } else {
      capture.start();
    }
  };

  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
