import type { FrameDimensions, FrameSource } from './frame-source.js';

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png']);

export class ImageFrameSource implements FrameSource {
  readonly mode = 'image' as const;
  private image: HTMLImageElement | null = null;
  private fileName: string | null = null;

  getFileName(): string | null {
    return this.fileName;
  }

  isReady(): boolean {
    if (!this.image) return false;
    return this.image.complete && this.image.naturalWidth > 0;
  }

  getDimensions(): FrameDimensions {
    if (!this.image) {
      return { width: 1280, height: 720 };
    }
    return {
      width: this.image.naturalWidth,
      height: this.image.naturalHeight,
    };
  }

  drawFrame(target: CanvasRenderingContext2D, width: number, height: number): boolean {
    if (!this.isReady() || !this.image) return false;
    target.drawImage(this.image, 0, 0, width, height);
    return true;
  }

  async start(): Promise<void> {
    // 静止画は loadImage で読み込み済み
  }

  stop(): void {
    this.clear();
  }

  async loadFile(file: File): Promise<void> {
    if (!ACCEPTED_TYPES.has(file.type)) {
      throw new Error('JPEG または PNG 形式の画像を選択してください');
    }

    const url = await readFileAsDataUrl(file);
    const image = await loadImage(url);
    this.image = image;
    this.fileName = file.name;
  }

  clear(): void {
    this.image = null;
    this.fileName = null;
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('画像の読み込みに失敗しました'));
    };
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    image.src = url;
  });
}

export function isAcceptedImageFile(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type);
}
