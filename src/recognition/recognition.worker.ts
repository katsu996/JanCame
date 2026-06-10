import type { RecognitionResult, RoiQuad } from '../types/index.js';
import type { OpenCvModule } from './opencv.d.js';
import { loadOpenCvInWorker } from './opencv-worker-loader.js';
import { runRecognitionPipeline } from './pipeline.js';
import type { TileTemplate } from './templates.js';
import { loadTileTemplates } from './templates.js';

export type WorkerInboundMessage =
  | { type: 'init' }
  | { type: 'frame'; frameId: number; imageData: ImageData; quad: RoiQuad };

export type WorkerOutboundMessage =
  | { type: 'ready'; hasOpenCv: boolean; templateCount: number }
  | { type: 'result'; frameId: number; result: RecognitionResult; timingMs: number }
  | { type: 'error'; frameId?: number; message: string };

let cvModule: OpenCvModule | null = null;
let templates: TileTemplate[] = [];

self.onmessage = (event: MessageEvent<WorkerInboundMessage>) => {
  void handleMessage(event.data);
};

async function handleMessage(message: WorkerInboundMessage): Promise<void> {
  if (message.type === 'init') {
    try {
      cvModule = await loadOpenCvInWorker();
      templates = await loadTileTemplates();
    } catch (error) {
      console.warn('[JanCame] Worker init error:', error);
    }
    postMessage({
      type: 'ready',
      hasOpenCv: cvModule !== null,
      templateCount: templates.length,
    } satisfies WorkerOutboundMessage);
    return;
  }

  if (message.type === 'frame') {
    const started = performance.now();
    try {
      const result = runRecognitionPipeline(message.imageData, {
        cv: cvModule,
        templates,
        quad: message.quad,
        frameId: message.frameId,
      });
      postMessage({
        type: 'result',
        frameId: message.frameId,
        result,
        timingMs: performance.now() - started,
      } satisfies WorkerOutboundMessage);
    } catch (error) {
      postMessage({
        type: 'error',
        frameId: message.frameId,
        message: error instanceof Error ? error.message : 'Recognition failed',
      } satisfies WorkerOutboundMessage);
    }
  }
}
