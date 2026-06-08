import type { OpenCvModule } from './opencv.d.js';
import {
  getTemplateMat,
  setTemplateMat,
  TEMPLATE_HEIGHT,
  TEMPLATE_WIDTH,
  type TileTemplate,
} from './templates.js';

export function toGrayMat(
  cv: OpenCvModule,
  imageData: ImageData,
): ReturnType<OpenCvModule['matFromImageData']> {
  const rgba = cv.matFromImageData(imageData);
  const gray = new cv.Mat();
  cv.cvtColor(rgba, gray, cv.COLOR_RGBA2GRAY);
  rgba.delete();
  return gray;
}

export function preprocessGrayMat(
  cv: OpenCvModule,
  gray: ReturnType<OpenCvModule['matFromImageData']>,
): ReturnType<OpenCvModule['matFromImageData']> {
  const normalized = new cv.Mat();
  cv.equalizeHist(gray, normalized);
  return normalized;
}

export function preprocessSlotMat(
  cv: OpenCvModule,
  imageData: ImageData,
): ReturnType<OpenCvModule['matFromImageData']> {
  const gray = toGrayMat(cv, imageData);
  const equalized = preprocessGrayMat(cv, gray);
  gray.delete();

  const resized = new cv.Mat();
  cv.resize(
    equalized,
    resized,
    new cv.Size(TEMPLATE_WIDTH, TEMPLATE_HEIGHT),
    0,
    0,
    cv.INTER_LINEAR,
  );
  equalized.delete();
  return resized;
}

export function buildTemplateMats(cv: OpenCvModule, templates: TileTemplate[]): void {
  for (const template of templates) {
    if (getTemplateMat(template)) continue;

    const context = template.canvas.getContext('2d');
    if (!context) continue;

    const imageData = context.getImageData(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    const gray = toGrayMat(cv, imageData);
    const equalized = preprocessGrayMat(cv, gray);
    gray.delete();
    setTemplateMat(template, equalized);
  }
}

export function detectTileLikeContours(
  cv: OpenCvModule,
  gray: ReturnType<OpenCvModule['matFromImageData']>,
): Array<{ x: number; y: number; width: number; height: number }> {
  const edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  const roiArea = gray.rows * gray.cols;
  const minArea = Math.max(200, roiArea * 0.004);
  const boxes: Array<{ x: number; y: number; width: number; height: number }> = [];

  for (let index = 0; index < contours.size(); index++) {
    const contour = contours.get(index);
    const area = cv.contourArea(contour);
    if (area < minArea) continue;

    const rect = cv.boundingRect(contour);
    const aspect = rect.width / rect.height;
    if (aspect < 0.35 || aspect > 1.25) continue;
    if (rect.height < gray.rows * 0.35) continue;

    boxes.push(rect);
  }

  edges.delete();
  contours.delete();
  hierarchy.delete();

  return dedupeBoxes(boxes.sort((left, right) => left.x - right.x)).slice(0, 14);
}

function dedupeBoxes(
  boxes: Array<{ x: number; y: number; width: number; height: number }>,
): Array<{ x: number; y: number; width: number; height: number }> {
  const filtered: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (const box of boxes) {
    const duplicate = filtered.some((existing) => overlapRatio(existing, box) > 0.5);
    if (!duplicate) filtered.push(box);
  }
  return filtered;
}

function overlapRatio(
  left: { x: number; y: number; width: number; height: number },
  right: { x: number; y: number; width: number; height: number },
): number {
  const x1 = Math.max(left.x, right.x);
  const y1 = Math.max(left.y, right.y);
  const x2 = Math.min(left.x + left.width, right.x + right.width);
  const y2 = Math.min(left.y + left.height, right.y + right.height);
  if (x2 <= x1 || y2 <= y1) return 0;

  const intersection = (x2 - x1) * (y2 - y1);
  const smaller = Math.min(left.width * left.height, right.width * right.height);
  return intersection / smaller;
}
