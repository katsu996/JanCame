import { tileLabel } from '../efficiency/tiles.js';
import type { FrameDimensions } from '../input/frame-source.js';
import { MATCH_THRESHOLD } from '../recognition/pipeline.js';
import type { EfficiencyResult, RecognitionResult, RoiQuad } from '../types/index.js';

export interface OverlayRendererOptions {
  canvas: HTMLCanvasElement;
  getDimensions: () => FrameDimensions;
}

export class OverlayRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly getDimensions: () => FrameDimensions;
  private readonly context: CanvasRenderingContext2D;
  private recognition: RecognitionResult | null = null;
  private efficiency: EfficiencyResult | null = null;
  private roiQuad: RoiQuad | null = null;

  constructor(options: OverlayRendererOptions) {
    this.canvas = options.canvas;
    this.getDimensions = options.getDimensions;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Overlay canvas unavailable');
    this.context = context;
  }

  resize(displayWidth: number, displayHeight: number): void {
    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;
  }

  setRecognition(result: RecognitionResult | null): void {
    this.recognition = result;
  }

  setEfficiency(result: EfficiencyResult | null): void {
    this.efficiency = result;
  }

  setRoiQuad(quad: RoiQuad | null): void {
    this.roiQuad = quad;
  }

  render(displayWidth: number, displayHeight: number): void {
    this.resize(displayWidth, displayHeight);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.roiQuad) {
      this.drawRoi(this.roiQuad);
    }

    if (!this.recognition) return;

    const recommendedTile = this.efficiency?.candidates[0]?.tile ?? null;

    for (const tile of this.recognition.tiles) {
      const { x, y, w, h } = this.scaleBox(tile.boundingBox);
      const isLowConfidence = !tile.id || tile.confidence < MATCH_THRESHOLD;
      this.context.strokeStyle = isLowConfidence
        ? '#facc15'
        : tile.id === recommendedTile
          ? '#ff4444'
          : '#00ff88';
      this.context.lineWidth = 2;
      this.context.strokeRect(x, y, w, h);

      const label = tile.id ? `${tileLabel(tile.id)} ${Math.round(tile.confidence * 100)}%` : '?';
      this.context.fillStyle = 'rgba(0, 0, 0, 0.65)';
      this.context.fillRect(x, y - 22, Math.max(52, label.length * 7), 20);
      this.context.fillStyle = '#fff';
      this.context.font = '12px sans-serif';
      this.context.fillText(label, x + 4, y - 8);

      if (tile.id && tile.id === recommendedTile) {
        this.context.fillStyle = '#ff4444';
        this.context.font = 'bold 16px sans-serif';
        this.context.fillText('切', x + w / 2 - 8, y + h / 2 + 6);
      }
    }
  }

  private drawRoi(quad: RoiQuad): void {
    const tl = this.scalePoint(quad.topLeft);
    const tr = this.scalePoint(quad.topRight);
    const br = this.scalePoint(quad.bottomRight);
    const bl = this.scalePoint(quad.bottomLeft);

    this.context.strokeStyle = 'rgba(255, 255, 0, 0.8)';
    this.context.lineWidth = 2;
    this.context.beginPath();
    this.context.moveTo(tl.x, tl.y);
    this.context.lineTo(tr.x, tr.y);
    this.context.lineTo(br.x, br.y);
    this.context.lineTo(bl.x, bl.y);
    this.context.closePath();
    this.context.stroke();
  }

  private scaleBox(box: { x: number; y: number; w: number; h: number }) {
    const source = this.getDimensions();
    const scaleX = this.canvas.width / Math.max(1, source.width);
    const scaleY = this.canvas.height / Math.max(1, source.height);
    return {
      x: box.x * scaleX,
      y: box.y * scaleY,
      w: box.w * scaleX,
      h: box.h * scaleY,
    };
  }

  private scalePoint(point: { x: number; y: number }) {
    const source = this.getDimensions();
    const scaleX = this.canvas.width / Math.max(1, source.width);
    const scaleY = this.canvas.height / Math.max(1, source.height);
    return { x: point.x * scaleX, y: point.y * scaleY };
  }
}
