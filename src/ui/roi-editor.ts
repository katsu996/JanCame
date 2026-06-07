import type { Point, RoiQuad } from '../types/index.js';

type CornerKey = keyof RoiQuad;

export interface RoiEditorOptions {
  container: HTMLElement;
  getVideoSize: () => { width: number; height: number };
  initialQuad: RoiQuad;
  onChange: (quad: RoiQuad) => void;
}

export class RoiEditor {
  private readonly container: HTMLElement;
  private readonly getVideoSize: () => { width: number; height: number };
  private readonly onChange: (quad: RoiQuad) => void;
  private quad: RoiQuad;
  private activeCorner: CornerKey | null = null;

  constructor(options: RoiEditorOptions) {
    this.container = options.container;
    this.getVideoSize = options.getVideoSize;
    this.onChange = options.onChange;
    this.quad = options.initialQuad;
    this.render();
    this.bindEvents();
  }

  getQuad(): RoiQuad {
    return this.quad;
  }

  setQuad(quad: RoiQuad): void {
    this.quad = quad;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    const corners: CornerKey[] = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];
    const { width, height } = this.getVideoSize();

    for (const corner of corners) {
      const handle = document.createElement('div');
      handle.className = `roi-handle roi-handle-${corner}`;
      handle.dataset.corner = corner;
      const point = this.quad[corner];
      handle.style.left = `${(point.x / Math.max(1, width)) * 100}%`;
      handle.style.top = `${(point.y / Math.max(1, height)) * 100}%`;
      this.container.appendChild(handle);
    }
  }

  private bindEvents(): void {
    this.container.addEventListener('pointerdown', (event) => {
      const target = (event.target as HTMLElement).dataset.corner as CornerKey | undefined;
      if (!target) return;
      this.activeCorner = target;
      this.container.setPointerCapture(event.pointerId);
    });

    this.container.addEventListener('pointermove', (event) => {
      if (!this.activeCorner) return;
      const rect = this.container.parentElement!.getBoundingClientRect();
      const { width, height } = this.getVideoSize();
      const x = Math.max(0, Math.min(width, ((event.clientX - rect.left) / rect.width) * width));
      const y = Math.max(0, Math.min(height, ((event.clientY - rect.top) / rect.height) * height));
      this.quad = { ...this.quad, [this.activeCorner]: { x, y } as Point };
      this.onChange(this.quad);
      this.render();
    });

    const stop = (event: PointerEvent): void => {
      if (!this.activeCorner) return;
      this.activeCorner = null;
      this.container.releasePointerCapture(event.pointerId);
    };

    this.container.addEventListener('pointerup', stop);
    this.container.addEventListener('pointercancel', stop);
  }
}
