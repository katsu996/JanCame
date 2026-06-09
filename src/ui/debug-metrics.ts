import { MATCH_THRESHOLD } from '../recognition/match.js';
import type { RecognitionResult } from '../types/index.js';

export interface RecognitionMetrics {
  lastFrameMs: number;
  recognizedCount: number;
  totalSlots: number;
  pipeline: 'worker' | 'main';
}

export class DebugMetricsPanel {
  private readonly root: HTMLElement;
  private readonly frameMsEl: HTMLElement;
  private readonly countEl: HTMLElement;
  private readonly pipelineEl: HTMLElement;

  constructor(appRoot: HTMLElement) {
    this.root = document.createElement('aside');
    this.root.className = 'debug-metrics hidden';
    this.root.setAttribute('aria-live', 'polite');

    const title = document.createElement('p');
    title.className = 'debug-metrics-title';
    title.textContent = '検証モード (?debug=1)';

    this.frameMsEl = document.createElement('p');
    this.countEl = document.createElement('p');
    this.pipelineEl = document.createElement('p');

    this.root.append(title, this.frameMsEl, this.countEl, this.pipelineEl);
    appRoot.querySelector('.header')?.insertAdjacentElement('afterend', this.root);
  }

  setVisible(visible: boolean): void {
    this.root.classList.toggle('hidden', !visible);
  }

  update(metrics: RecognitionMetrics): void {
    this.frameMsEl.textContent = `処理時間: ${Math.round(metrics.lastFrameMs)} ms`;
    this.countEl.textContent = `認識: ${metrics.recognizedCount}/${metrics.totalSlots}（閾値 ${Math.round(MATCH_THRESHOLD * 100)}% 以上）`;
    this.pipelineEl.textContent = `パイプライン: ${metrics.pipeline === 'worker' ? 'Worker' : 'メインスレッド'}`;
  }
}

export function countRecognizedTiles(result: RecognitionResult): number {
  return result.tiles.filter((tile) => tile.id !== null && tile.confidence >= MATCH_THRESHOLD)
    .length;
}
