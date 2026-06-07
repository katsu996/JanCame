import type { OpenCvModule } from './opencv.d.js';

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

export function detectTileLikeContours(
  cv: OpenCvModule,
  gray: ReturnType<OpenCvModule['matFromImageData']>,
): Array<{ x: number; y: number; width: number; height: number }> {
  const edges = new cv.Mat();
  cv.Canny(gray, edges, 50, 150);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  const boxes: Array<{ x: number; y: number; width: number; height: number }> = [];
  for (let index = 0; index < contours.size(); index++) {
    const contour = contours.get(index);
    const area = cv.contourArea(contour);
    if (area < 500) continue;

    const rect = cv.boundingRect(contour);
    const aspect = rect.width / rect.height;
    if (aspect < 0.45 || aspect > 1.2) continue;

    boxes.push(rect);
  }

  edges.delete();
  contours.delete();
  hierarchy.delete();

  return boxes.sort((left, right) => left.x - right.x);
}
