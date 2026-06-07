export interface FrameCaptureOptions {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  fps?: number;
  onFrame: (imageData: ImageData, timestamp: number) => void;
  shouldCapture?: () => boolean;
}

export class FrameCapture {
  private readonly video: HTMLVideoElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly onFrame: (imageData: ImageData, timestamp: number) => void;
  private readonly intervalMs: number;
  private readonly shouldCapture: () => boolean;
  private timerId: number | null = null;
  private frameId = 0;

  constructor(options: FrameCaptureOptions) {
    this.video = options.video;
    this.canvas = options.canvas;
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }
    this.context = context;
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
    if (this.video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    if (document.visibilityState === 'hidden') return;

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;
    if (width === 0 || height === 0) return;

    this.canvas.width = width;
    this.canvas.height = height;
    this.context.drawImage(this.video, 0, 0, width, height);
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
