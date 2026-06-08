import type { RecognitionResult, RoiQuad } from '../types/index.js';
import type { WorkerInboundMessage, WorkerOutboundMessage } from './recognition.worker.js';

export interface RecognitionWorkerClientOptions {
  onResult: (frameId: number, result: RecognitionResult, timingMs: number) => void;
  onError?: (message: string) => void;
  onProgress?: (message: string) => void;
}

export class RecognitionWorkerClient {
  private worker: Worker | null = null;
  private latestRequestedFrameId = 0;
  private ready = false;
  private readonly onResult: RecognitionWorkerClientOptions['onResult'];
  private readonly onError: NonNullable<RecognitionWorkerClientOptions['onError']>;
  private readonly onProgress: NonNullable<RecognitionWorkerClientOptions['onProgress']>;

  constructor(options: RecognitionWorkerClientOptions) {
    this.onResult = options.onResult;
    this.onError = options.onError ?? (() => undefined);
    this.onProgress = options.onProgress ?? (() => undefined);
  }

  isReady(): boolean {
    return this.ready;
  }

  async init(): Promise<boolean> {
    if (typeof Worker === 'undefined') {
      return false;
    }

    this.onProgress('認識 Worker を初期化中…');
    this.worker = new Worker(new URL('./recognition.worker.ts', import.meta.url), {
      type: 'module',
    });

    return new Promise((resolve) => {
      if (!this.worker) {
        resolve(false);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        this.onProgress('認識 Worker の初期化がタイムアウトしました');
        resolve(false);
      }, 20_000);

      this.worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
        const message = event.data;
        if (message.type === 'ready') {
          window.clearTimeout(timeoutId);
          this.ready = true;
          this.onProgress(
            message.hasOpenCv
              ? '認識 Worker 準備完了（OpenCV 有効）'
              : '認識 Worker 準備完了（OpenCV なし）',
          );
          resolve(true);
          return;
        }

        if (message.type === 'result') {
          if (message.frameId < this.latestRequestedFrameId) return;
          this.onResult(message.frameId, message.result, message.timingMs);
          return;
        }

        if (message.type === 'error') {
          this.onError(message.message);
        }
      };

      this.worker.onerror = () => {
        window.clearTimeout(timeoutId);
        this.onError('Recognition worker crashed');
        resolve(false);
      };

      this.worker.postMessage({ type: 'init' } satisfies WorkerInboundMessage);
    });
  }

  submitFrame(frameId: number, imageData: ImageData, quad: RoiQuad): void {
    if (!this.worker || !this.ready) return;
    this.latestRequestedFrameId = frameId;
    this.worker.postMessage({
      type: 'frame',
      frameId,
      imageData,
      quad,
    } satisfies WorkerInboundMessage);
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
  }
}
