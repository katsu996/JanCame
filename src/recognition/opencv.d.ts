declare global {
  interface Window {
    cv: OpenCvModule;
  }
}

export interface OpenCvModule {
  Mat: new (...args: unknown[]) => CvMat;
  onRuntimeInitialized?: () => void;
  matFromImageData(imageData: ImageData): CvMat;
  imread(element: HTMLCanvasElement | HTMLImageElement): CvMat;
  cvtColor(src: CvMat, dst: CvMat, code: number): void;
  Canny(src: CvMat, dst: CvMat, threshold1: number, threshold2: number): void;
  findContours(
    src: CvMat,
    contours: CvMatVector,
    hierarchy: CvMat,
    mode: number,
    method: number,
  ): void;
  contourArea(contour: CvMat): number;
  boundingRect(contour: CvMat): { x: number; y: number; width: number; height: number };
  getPerspectiveTransform(src: CvMat, dst: CvMat): CvMat;
  warpPerspective(src: CvMat, dst: CvMat, matrix: CvMat, size: CvSize): void;
  matchTemplate(src: CvMat, templ: CvMat, dst: CvMat, method: number): void;
  minMaxLoc(src: CvMat): { minVal: number; maxVal: number; minLoc: CvPoint; maxLoc: CvPoint };
  equalizeHist(src: CvMat, dst: CvMat): void;
  resize(
    src: CvMat,
    dst: CvMat,
    dsize: CvSize,
    fx?: number,
    fy?: number,
    interpolation?: number,
  ): void;
  MatVector: new () => CvMatVector;
  COLOR_RGBA2GRAY: number;
  RETR_EXTERNAL: number;
  CHAIN_APPROX_SIMPLE: number;
  TM_CCOEFF_NORMED: number;
  INTER_LINEAR: number;
  Size: new (width: number, height: number) => CvSize;
  Point: new (x: number, y: number) => CvPoint;
  delete(...mats: unknown[]): void;
}

export interface CvMat {
  rows: number;
  cols: number;
  delete(): void;
}

export interface CvMatVector {
  size(): number;
  get(index: number): CvMat;
  delete(): void;
}

export interface CvPoint {
  x: number;
  y: number;
}

export interface CvSize {
  width: number;
  height: number;
}
