import type { OpenCvModule } from './opencv.d.js';

/** jsDelivr 経由（docs.opencv.org より安定） */
const OPENCV_JS_URL =
  'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.9.0-release.3/dist/opencv.js';

const LOAD_TIMEOUT_MS = 10_000;

let loadPromise: Promise<OpenCvModule | null> | null = null;

function isOpenCvReady(cv: unknown): cv is OpenCvModule {
  return (
    typeof cv === 'object' &&
    cv !== null &&
    'Mat' in cv &&
    typeof (cv as OpenCvModule).Mat === 'function'
  );
}

export function loadOpenCv(onProgress?: (message: string) => void): Promise<OpenCvModule | null> {
  if (isOpenCvReady(window.cv)) {
    return Promise.resolve(window.cv);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    onProgress?.('OpenCV.js を読み込み中…');

    let settled = false;
    const finish = (cv: OpenCvModule | null, message?: string): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (message) onProgress?.(message);
      resolve(cv);
    };

    const timeoutId = window.setTimeout(() => {
      console.warn('[JanCame] OpenCV.js load timeout — continuing without contour detection');
      finish(null, 'OpenCV.js をスキップ（輪郭検出なしで続行）');
    }, LOAD_TIMEOUT_MS);

    const script = document.createElement('script');
    script.src = OPENCV_JS_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onerror = () => {
      console.warn('[JanCame] OpenCV.js script failed to load');
      finish(null, 'OpenCV.js 読み込み失敗（輪郭検出なしで続行）');
    };

    script.onload = () => {
      void waitForOpenCvRuntime(onProgress)
        .then((cv) => finish(cv, 'OpenCV.js 準備完了'))
        .catch(() => finish(null, 'OpenCV.js 初期化失敗（輪郭検出なしで続行）'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

async function waitForOpenCvRuntime(onProgress?: (message: string) => void): Promise<OpenCvModule> {
  onProgress?.('OpenCV.js を初期化中…');

  // OpenCV 4.x: cv が Promise になる場合
  if (window.cv && typeof (window.cv as unknown as Promise<OpenCvModule>).then === 'function') {
    const cv = await (window.cv as unknown as Promise<OpenCvModule>);
    window.cv = cv;
    if (isOpenCvReady(cv)) return cv;
    throw new Error('OpenCV promise resolved but Mat unavailable');
  }

  // すでに初期化済み
  if (isOpenCvReady(window.cv)) {
    return window.cv;
  }

  // Emscripten: onRuntimeInitialized を待つ
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + LOAD_TIMEOUT_MS;

    const tryResolve = (): boolean => {
      if (isOpenCvReady(window.cv)) {
        resolve(window.cv);
        return true;
      }
      return false;
    };

    if (tryResolve()) return;

    const previousHook = window.cv?.onRuntimeInitialized;
    const cvObject = window.cv ?? {};
    window.cv = cvObject;

    cvObject.onRuntimeInitialized = () => {
      previousHook?.();
      if (!tryResolve()) {
        reject(new Error('onRuntimeInitialized fired but cv.Mat unavailable'));
      }
    };

    // Module フック（Emscripten 標準）
    const globalWindow = window as Window & { Module?: { onRuntimeInitialized?: () => void } };
    const previousModuleHook = globalWindow.Module?.onRuntimeInitialized;
    globalWindow.Module = {
      ...globalWindow.Module,
      onRuntimeInitialized: () => {
        previousModuleHook?.();
        if (tryResolve()) return;
        cvObject.onRuntimeInitialized?.();
      },
    };

    const poll = (): void => {
      if (tryResolve()) return;
      if (Date.now() > deadline) {
        reject(new Error('OpenCV runtime init timeout'));
        return;
      }
      window.setTimeout(poll, 100);
    };
    poll();
  });
}

export function getOpenCv(): OpenCvModule {
  if (!isOpenCvReady(window.cv)) {
    throw new Error('OpenCV.js is not loaded');
  }
  return window.cv;
}

export function isOpenCvLoaded(): boolean {
  return isOpenCvReady(window.cv);
}
