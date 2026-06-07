import { ALL_TILES } from '../efficiency/tiles.js';
import type { TileId } from '../types/index.js';

export interface CorrectionRow {
  index: number;
  id: TileId | null;
}

export class CorrectionPanel {
  private readonly root: HTMLElement;
  private readonly onChange: (index: number, tileId: TileId) => void;

  constructor(root: HTMLElement, onChange: (index: number, tileId: TileId) => void) {
    this.root = root;
    this.onChange = onChange;
  }

  render(rows: CorrectionRow[]): void {
    this.root.innerHTML = '';
    if (rows.length === 0) return;

    const heading = document.createElement('h2');
    heading.textContent = '手動補正';
    this.root.appendChild(heading);

    for (const row of rows) {
      const element = document.createElement('div');
      element.className = 'correction-row';

      const label = document.createElement('span');
      label.textContent = `#${row.index + 1}`;

      const select = document.createElement('select');
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '?';
      select.appendChild(empty);

      for (const tile of ALL_TILES) {
        const option = document.createElement('option');
        option.value = tile;
        option.textContent = tile;
        if (row.id === tile) option.selected = true;
        select.appendChild(option);
      }

      select.addEventListener('change', () => {
        if (select.value) {
          this.onChange(row.index, select.value as TileId);
        }
      });

      element.append(label, select);
      this.root.appendChild(element);
    }
  }
}
