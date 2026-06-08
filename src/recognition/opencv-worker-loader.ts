import type { OpenCvModule } from './opencv.d.js';

const OPENCV_JS_URL = 'https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.10.0/dist/opencv.js';
const LOAD_TIMEOUT_MS = 20_000;

function isOpenCvReady(cv: unknown): cv is OpenCvModule {
  return (
    typeof cv === 'object' &&
    cv !== null &&
    'Mat' in cv &&
    typeof (cv as OpenCvModule).Mat === 'function'
  );
}

type OpenCvWorkerScope = DedicatedWorkerGlobalScope & {
  cv?: OpenCvModule & { onRuntimeInitialized?: () => void };
};

export function loadOpenCvInWorker(): Promise<OpenCvModule | null> {
  const workerScope = self as OpenCvWorkerScope;

  if (isOpenCvReady(workerScope.cv)) {
    return Promise.resolve(workerScope.cv);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (cv: OpenCvModule | null): void => {
      if (settled) return;
      settled = true;
      resolve(cv);
    };

    const timeoutId = self.setTimeout(() => {
      console.warn('[JanCame] OpenCV.js worker load timeout');
      finish(null);
    }, LOAD_TIMEOUT_MS);

    const tryResolve = (): boolean => {
      if (isOpenCvReady(workerScope.cv)) {
        self.clearTimeout(timeoutId);
        finish(workerScope.cv);
        return true;
      }
      return false;
    };

    workerScope.onerror = () => {
      self.clearTimeout(timeoutId);
      finish(null);
    };

    try {
      workerScope.importScripts(OPENCV_JS_URL);
    } catch (error) {
      console.warn('[JanCame] OpenCV.js worker importScripts failed', error);
      self.clearTimeout(timeoutId);
      finish(null);
      return;
    }

    if (tryResolve()) return;

    const cvObject = (workerScope.cv ?? {}) as OpenCvModule & {
      onRuntimeInitialized?: () => void;
    };
    workerScope.cv = cvObject;
    cvObject.onRuntimeInitialized = () => {
      tryResolve();
    };

    const startedAt = Date.now();
    const poll = (): void => {
      if (tryResolve()) return;
      if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        self.clearTimeout(timeoutId);
        finish(null);
        return;
      }
      self.setTimeout(poll, 100);
    };
    poll();
  });
}
