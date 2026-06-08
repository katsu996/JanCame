import type { RecognitionResult, RecognizedTile, RoiQuad } from '../types/index.js';
import { MATCH_THRESHOLD, matchTileImage, matchTileImageSimple } from './match.js';
import type { OpenCvModule } from './opencv.d.js';
import { detectTileLikeContours, toGrayMat } from './preprocess.js';
import { extractRoiImageData, roiBounds } from './roi.js';
import { estimateTileCount, splitByContours, splitIntoTileSlots } from './split.js';
import type { TileTemplate } from './templates.js';

export interface RecognitionPipelineOptions {
  cv: OpenCvModule | null;
  templates: TileTemplate[];
  quad: RoiQuad;
  frameId: number;
}

export { MATCH_THRESHOLD };

export function runRecognitionPipeline(
  imageData: ImageData,
  options: RecognitionPipelineOptions,
): RecognitionResult {
  const bounds = roiBounds(options.quad);
  const roiImage = extractRoiImageData(imageData, options.quad);
  const screenScale = {
    x: bounds.w / roiImage.width,
    y: bounds.h / roiImage.height,
  };
  const screenOffset = { x: bounds.x, y: bounds.y };

  let slots = splitIntoTileSlots(roiImage, 14, screenOffset, screenScale);

  if (options.cv) {
    const gray = toGrayMat(options.cv, roiImage);
    const contours = detectTileLikeContours(options.cv, gray);
    const contourSlots = splitByContours(roiImage, contours, screenOffset, screenScale);
    if (contourSlots) {
      slots = contourSlots;
    } else {
      const tileCount = estimateTileCount(contours.length, 14);
      slots = splitIntoTileSlots(roiImage, tileCount, screenOffset, screenScale);
    }
    gray.delete();
  }

  const tiles: RecognizedTile[] = slots.map((slot) => {
    const match = options.cv
      ? matchTileImage(options.cv, slot.image, options.templates)
      : matchTileImageSimple(slot.image, options.templates);

    return {
      id: match.id,
      confidence: match.confidence,
      boundingBox: slot.boundingBox,
    };
  });

  return {
    tiles,
    timestamp: performance.now(),
    frameId: options.frameId,
  };
}
