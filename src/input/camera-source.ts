import { CameraError, startCameraStream, stopCameraStream } from '../camera/stream.js';
import type { FrameDimensions, FrameSource } from './frame-source.js';

export class CameraFrameSource implements FrameSource {
  readonly mode = 'camera' as const;
  private readonly video: HTMLVideoElement;
  private stream: MediaStream | null = null;
  private enabled = true;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
      this.video.style.visibility = 'hidden';
    } else {
      this.video.style.visibility = 'visible';
    }
  }

  isReady(): boolean {
    if (!this.enabled) return false;
    return this.video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
  }

  getDimensions(): FrameDimensions {
    return {
      width: this.video.videoWidth || 1280,
      height: this.video.videoHeight || 720,
    };
  }

  drawFrame(target: CanvasRenderingContext2D, width: number, height: number): boolean {
    if (!this.isReady()) return false;
    target.drawImage(this.video, 0, 0, width, height);
    return true;
  }

  async start(): Promise<void> {
    if (!this.enabled) return;
    if (this.stream) return;

    this.stream = await startCameraStream({ video: this.video });
  }

  stop(): void {
    stopCameraStream(this.stream);
    this.stream = null;
    this.video.srcObject = null;
  }

  async restart(): Promise<void> {
    this.stop();
    if (this.enabled) {
      await this.start();
    }
  }

  getCameraErrorMessage(error: unknown): string {
    return error instanceof CameraError ? error.message : 'カメラの起動に失敗しました';
  }
}
