import { CameraFrameSource } from './camera-source.js';
import type { InputMode } from './frame-source.js';
import { ImageFrameSource } from './image-source.js';

export type InputChangeListener = (mode: InputMode, fileName: string | null) => void;

export class InputManager {
  readonly camera: CameraFrameSource;
  readonly image: ImageFrameSource;
  private mode: InputMode = 'camera';
  private listeners: InputChangeListener[] = [];

  constructor(video: HTMLVideoElement) {
    this.camera = new CameraFrameSource(video);
    this.image = new ImageFrameSource();
  }

  getMode(): InputMode {
    return this.mode;
  }

  getActiveSource(): CameraFrameSource | ImageFrameSource {
    return this.mode === 'image' ? this.image : this.camera;
  }

  onChange(listener: InputChangeListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  async setCameraEnabled(enabled: boolean): Promise<void> {
    this.camera.setEnabled(enabled);
    if (this.mode === 'camera') {
      if (enabled) {
        await this.camera.start();
      } else {
        this.camera.stop();
      }
    }
  }

  async switchToCamera(): Promise<void> {
    this.mode = 'camera';
    this.image.clear();
    if (this.camera.isEnabled()) {
      await this.camera.restart();
    }
    this.notify();
  }

  async loadImageFile(file: File): Promise<void> {
    this.camera.stop();
    await this.image.loadFile(file);
    this.mode = 'image';
    this.notify();
  }

  async clearImage(): Promise<void> {
    if (this.mode !== 'image') return;
    this.image.clear();
    this.mode = 'camera';
    if (this.camera.isEnabled()) {
      await this.camera.restart();
    }
    this.notify();
  }

  private notify(): void {
    const fileName = this.mode === 'image' ? this.image.getFileName() : null;
    for (const listener of this.listeners) {
      listener(this.mode, fileName);
    }
  }
}
