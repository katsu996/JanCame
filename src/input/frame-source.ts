export type InputMode = 'camera' | 'image';

export interface FrameDimensions {
  width: number;
  height: number;
}

export interface FrameSource {
  readonly mode: InputMode;
  isReady(): boolean;
  getDimensions(): FrameDimensions;
  drawFrame(target: CanvasRenderingContext2D, width: number, height: number): boolean;
  start(): Promise<void>;
  stop(): void;
}

export interface FrameCaptureContext {
  isReady(): boolean;
  getDimensions(): FrameDimensions;
  drawFrame(target: CanvasRenderingContext2D, width: number, height: number): boolean;
}
