import type { Point, RoiQuad } from '../types/index.js';
import { createEmptyImageData } from './image-data.js';

export function defaultRoiQuad(width: number, height: number): RoiQuad {
  const marginX = width * 0.05;
  const marginY = height * 0.35;
  return {
    topLeft: { x: marginX, y: marginY },
    topRight: { x: width - marginX, y: marginY },
    bottomRight: { x: width - marginX, y: height - marginY },
    bottomLeft: { x: marginX, y: height - marginY },
  };
}

export function extractRoiImageData(imageData: ImageData, quad: RoiQuad): ImageData {
  const minX = Math.max(0, Math.floor(Math.min(quad.topLeft.x, quad.bottomLeft.x)));
  const minY = Math.max(0, Math.floor(Math.min(quad.topLeft.y, quad.topRight.y)));
  const maxX = Math.min(imageData.width, Math.ceil(Math.max(quad.topRight.x, quad.bottomRight.x)));
  const maxY = Math.min(
    imageData.height,
    Math.ceil(Math.max(quad.bottomLeft.y, quad.bottomRight.y)),
  );
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);

  const output = createEmptyImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sourceX = minX + x;
      const sourceY = minY + y;
      const sourceIndex = (sourceY * imageData.width + sourceX) * 4;
      const targetIndex = (y * width + x) * 4;
      output.data[targetIndex] = imageData.data[sourceIndex];
      output.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
      output.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
      output.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
    }
  }

  return output;
}

export function quadToScreenPoints(quad: RoiQuad, scaleX: number, scaleY: number): RoiQuad {
  return {
    topLeft: scalePoint(quad.topLeft, scaleX, scaleY),
    topRight: scalePoint(quad.topRight, scaleX, scaleY),
    bottomRight: scalePoint(quad.bottomRight, scaleX, scaleY),
    bottomLeft: scalePoint(quad.bottomLeft, scaleX, scaleY),
  };
}

function scalePoint(point: Point, scaleX: number, scaleY: number): Point {
  return { x: point.x * scaleX, y: point.y * scaleY };
}

export function roiBounds(quad: RoiQuad): { x: number; y: number; w: number; h: number } {
  const x = Math.min(quad.topLeft.x, quad.bottomLeft.x);
  const y = Math.min(quad.topLeft.y, quad.topRight.y);
  const w = Math.max(quad.topRight.x, quad.bottomRight.x) - x;
  const h = Math.max(quad.bottomLeft.y, quad.bottomRight.y) - y;
  return { x, y, w, h };
}
