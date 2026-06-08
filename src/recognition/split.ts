import type { BoundingBox } from '../types/index.js';
import { createEmptyImageData } from './image-data.js';

export function splitIntoTileSlots(
  roiImage: ImageData,
  tileCount: number,
  screenOffset: { x: number; y: number },
  screenScale: { x: number; y: number },
): Array<{ image: ImageData; boundingBox: BoundingBox }> {
  const count = Math.min(Math.max(tileCount, 1), 14);
  const slotWidth = Math.floor(roiImage.width / count);
  const slots: Array<{ image: ImageData; boundingBox: BoundingBox }> = [];

  for (let index = 0; index < count; index++) {
    const x = index * slotWidth;
    const width = index === count - 1 ? roiImage.width - x : slotWidth;
    const image = cropImageData(roiImage, x, 0, width, roiImage.height);
    slots.push({
      image,
      boundingBox: {
        x: screenOffset.x + x * screenScale.x,
        y: screenOffset.y,
        w: width * screenScale.x,
        h: roiImage.height * screenScale.y,
      },
    });
  }

  return slots;
}

export function splitByContours(
  roiImage: ImageData,
  contours: Array<{ x: number; y: number; width: number; height: number }>,
  screenOffset: { x: number; y: number },
  screenScale: { x: number; y: number },
): Array<{ image: ImageData; boundingBox: BoundingBox }> | null {
  if (contours.length < 10 || contours.length > 14) {
    return null;
  }

  return contours.map((rect) => ({
    image: cropImageData(roiImage, rect.x, rect.y, rect.width, rect.height),
    boundingBox: {
      x: screenOffset.x + rect.x * screenScale.x,
      y: screenOffset.y + rect.y * screenScale.y,
      w: rect.width * screenScale.x,
      h: rect.height * screenScale.y,
    },
  }));
}

export function cropImageData(
  source: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
): ImageData {
  const output = createEmptyImageData(width, height);
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const sourceIndex = ((y + row) * source.width + (x + col)) * 4;
      const targetIndex = (row * width + col) * 4;
      output.data[targetIndex] = source.data[sourceIndex];
      output.data[targetIndex + 1] = source.data[sourceIndex + 1];
      output.data[targetIndex + 2] = source.data[sourceIndex + 2];
      output.data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }
  return output;
}

export function estimateTileCount(contourCount: number, fallback = 14): number {
  if (contourCount >= 13 && contourCount <= 14) return contourCount;
  if (contourCount >= 10 && contourCount <= 14) return contourCount;
  return fallback;
}
