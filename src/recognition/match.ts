import type { TileId } from '../types/index.js';
import type { OpenCvModule } from './opencv.d.js';
import type { TileTemplate } from './templates.js';

export const MATCH_THRESHOLD = 0.55;

export interface MatchResult {
  id: TileId | null;
  confidence: number;
}

export function matchTileImage(
  _cv: OpenCvModule,
  tileImage: ImageData,
  templates: TileTemplate[],
): MatchResult {
  return matchTileImageSimple(tileImage, templates);
}

export function matchTileImageSimple(tileImage: ImageData, templates: TileTemplate[]): MatchResult {
  let best: MatchResult = { id: null, confidence: 0 };

  for (const template of templates) {
    const confidence = normalizedCorrelation(tileImage, template.canvas);
    if (confidence > best.confidence) {
      best = { id: template.id, confidence };
    }
  }

  if (best.confidence < MATCH_THRESHOLD) {
    return { id: null, confidence: best.confidence };
  }

  return best;
}

function normalizedCorrelation(source: ImageData, templateCanvas: HTMLCanvasElement): number {
  const canvas = document.createElement('canvas');
  canvas.width = templateCanvas.width;
  canvas.height = templateCanvas.height;
  const context = canvas.getContext('2d')!;
  context.drawImage(
    createCanvasFromImageData(source),
    0,
    0,
    templateCanvas.width,
    templateCanvas.height,
  );
  const resized = context.getImageData(0, 0, templateCanvas.width, templateCanvas.height);
  const template = templateCanvas
    .getContext('2d')!
    .getImageData(0, 0, templateCanvas.width, templateCanvas.height);

  let sum = 0;
  let sourceSum = 0;
  let templateSum = 0;
  let sourceSq = 0;
  let templateSq = 0;
  const pixelCount = template.width * template.height;

  for (let index = 0; index < pixelCount; index++) {
    const sourceValue = grayscale(resized, index);
    const templateValue = grayscale(template, index);
    sum += sourceValue * templateValue;
    sourceSum += sourceValue;
    templateSum += templateValue;
    sourceSq += sourceValue * sourceValue;
    templateSq += templateValue * templateValue;
  }

  const numerator = pixelCount * sum - sourceSum * templateSum;
  const denominator = Math.sqrt(
    (pixelCount * sourceSq - sourceSum * sourceSum) *
      (pixelCount * templateSq - templateSum * templateSum),
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

function grayscale(image: ImageData, pixelIndex: number): number {
  const offset = pixelIndex * 4;
  return (image.data[offset] + image.data[offset + 1] + image.data[offset + 2]) / 3;
}

function createCanvasFromImageData(imageData: ImageData): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d')!.putImageData(imageData, 0, 0);
  return canvas;
}
