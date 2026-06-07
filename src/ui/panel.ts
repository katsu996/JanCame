import { tileUnicode } from '../efficiency/tiles.js';
import type { EfficiencyResult } from '../types/index.js';

export class EfficiencyPanel {
  private readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(result: EfficiencyResult | null, error: string | null = null): void {
    this.root.innerHTML = '';

    const status = document.createElement('section');
    status.className = 'panel-section';
    const title = document.createElement('h2');
    title.textContent = '現在の状態';
    status.appendChild(title);

    const shanten = document.createElement('p');
    shanten.className = 'shanten-value';
    if (error) {
      shanten.textContent = error;
    } else if (!result) {
      shanten.textContent = '認識待ち…';
    } else {
      shanten.textContent = result.shanten <= 0 ? `${result.shanten}向聴` : `${result.shanten}向聴`;
    }
    status.appendChild(shanten);
    this.root.appendChild(status);

    if (!result || result.candidates.length === 0) {
      const hint = document.createElement('p');
      hint.className = 'panel-hint';
      hint.textContent =
        result?.candidates.length === 0 ? '14枚認識されると打牌候補を表示します' : '';
      if (hint.textContent) this.root.appendChild(hint);
      return;
    }

    const listSection = document.createElement('section');
    listSection.className = 'panel-section';
    const listTitle = document.createElement('h2');
    listTitle.textContent = '何を切る？';
    listSection.appendChild(listTitle);

    const list = document.createElement('ul');
    list.className = 'candidate-list';

    for (const candidate of result.candidates) {
      const item = document.createElement('li');
      item.className = 'candidate-item';
      const ukeireText =
        candidate.ukeireTiles.length > 0 ? candidate.ukeireTiles.join(', ') : 'なし';
      item.innerHTML = `
        <span class="candidate-tile">${tileUnicode(candidate.tile)} ${candidate.tile}</span>
        <span class="candidate-detail">を切る → 受け入れ: ${ukeireText}（${candidate.ukeireCount}枚）</span>
      `;
      list.appendChild(item);
    }

    listSection.appendChild(list);
    this.root.appendChild(listSection);
  }
}

export function showCameraError(element: HTMLElement, message: string, onRetry: () => void): void {
  element.textContent = message;
  element.classList.remove('hidden');

  const existing = element.querySelector('button');
  if (!existing) {
    const button = document.createElement('button');
    button.textContent = '再試行';
    button.addEventListener('click', onRetry);
    element.appendChild(button);
  }
}

export function hideCameraError(element: HTMLElement): void {
  element.classList.add('hidden');
  element.textContent = '';
}

export function setLoadingVisible(element: HTMLElement, visible: boolean): void {
  element.classList.toggle('hidden', !visible);
}
