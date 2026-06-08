import type { TileId } from '../types/index.js';
import type { OpenCvModule } from './opencv.d.js';
import { buildTemplateMats, preprocessSlotMat } from './preprocess.js';
import type { TileTemplate } from './templates.js';
import { getTemplateMat, TEMPLATE_HEIGHT, TEMPLATE_WIDTH } from './templates.js';

export const MATCH_THRESHOLD = 0.72;

export type MatchMethod = 'opencv' | 'fallback';

export interface MatchResult {
  id: TileId | null;
  confidence: number;
  method: MatchMethod;
}

export interface PixelSurface {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

let templatesPrepared = false;

export function ensureTemplateMats(cv: OpenCvModule, templates: TileTemplate[]): void {
  if (templatesPrepared) return;
  buildTemplateMats(cv, templates);
  templatesPrepared = true;
}

export function resetTemplateMatCache(): void {
  templatesPrepared = false;
}

export function imageDataToSurface(imageData: ImageData): PixelSurface {
  return {
    width: imageData.width,
    height: imageData.height,
    data: imageData.data,
  };
}

export function surfaceFromCanvas(canvas: HTMLCanvasElement): PixelSurface {
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to read template canvas');
  }
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return imageDataToSurface(imageData);
}

export function matchTileSurface(
  slot: PixelSurface,
  templates: Array<{ id: TileId; surface: PixelSurface }>,
): MatchResult {
  let best: MatchResult = { id: null, confidence: 0, method: 'fallback' };

  for (const template of templates) {
    const confidence = normalizedCorrelation(slot, template.surface);
    if (confidence > best.confidence) {
      best = { id: template.id, confidence, method: 'fallback' };
    }
  }

  if (best.confidence < MATCH_THRESHOLD) {
    return { id: null, confidence: best.confidence, method: 'fallback' };
  }

  return best;
}

export function matchTileImage(
  cv: OpenCvModule,
  tileImage: ImageData,
  templates: TileTemplate[],
): MatchResult {
  ensureTemplateMats(cv, templates);

  const slotMat = preprocessSlotMat(cv, tileImage);
  const resultMat = new cv.Mat();
  let best: MatchResult = { id: null, confidence: 0, method: 'opencv' };

  for (const template of templates) {
    const templateMat = getTemplateMat(template);
    if (!templateMat) continue;

    cv.matchTemplate(slotMat, templateMat, resultMat, cv.TM_CCOEFF_NORMED);
    const { maxVal } = cv.minMaxLoc(resultMat);
    if (maxVal > best.confidence) {
      best = { id: template.id, confidence: maxVal, method: 'opencv' };
    }
  }

  resultMat.delete();
  slotMat.delete();

  if (best.confidence < MATCH_THRESHOLD) {
    const fallback = matchTileImageSimple(tileImage, templates);
    if (fallback.confidence > best.confidence) {
      return fallback;
    }
    return { id: null, confidence: best.confidence, method: 'opencv' };
  }

  return best;
}

export function matchTileImageSimple(tileImage: ImageData, templates: TileTemplate[]): MatchResult {
  const slot = imageDataToSurface(tileImage);
  const surfaces = templates.map((template) => ({
    id: template.id,
    surface: template.surface ?? surfaceFromCanvas(template.canvas),
  }));
  return matchTileSurface(slot, surfaces);
}

function normalizedCorrelation(source: PixelSurface, template: PixelSurface): number {
  const resized = resizeSurface(source, template.width, template.height);
  let sum = 0;
  let sourceSum = 0;
  let templateSum = 0;
  let sourceSq = 0;
  let templateSq = 0;
  const pixelCount = template.width * template.height;

  for (let index = 0; index < pixelCount; index++) {
    const sourceValue = grayscaleAt(resized, index);
    const templateValue = grayscaleAt(template, index);
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

function grayscaleAt(surface: PixelSurface, pixelIndex: number): number {
  const offset = pixelIndex * 4;
  return (surface.data[offset] + surface.data[offset + 1] + surface.data[offset + 2]) / 3;
}

function resizeSurface(source: PixelSurface, width: number, height: number): PixelSurface {
  if (source.width === width && source.height === height) {
    return source;
  }

  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceX = Math.floor((x / width) * source.width);
      const sourceY = Math.floor((y / height) * source.height);
      const sourceIndex = (sourceY * source.width + sourceX) * 4;
      const targetIndex = (y * width + x) * 4;
      data[targetIndex] = source.data[sourceIndex];
      data[targetIndex + 1] = source.data[sourceIndex + 1];
      data[targetIndex + 2] = source.data[sourceIndex + 2];
      data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }

  return { width, height, data };
}

export function getTemplateMatchSize(): { width: number; height: number } {
  return { width: TEMPLATE_WIDTH, height: TEMPLATE_HEIGHT };
}
