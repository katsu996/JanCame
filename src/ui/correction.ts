import { ALL_TILES, tileLabel } from '../efficiency/tiles.js';
import type { TileId } from '../types/index.js';

export interface CorrectionRow {
  index: number;
  id: TileId | null;
}

export class CorrectionPanel {
  private readonly root: HTMLElement;
  private readonly onChange: (index: number, tileId: TileId) => void;
  private activePicker: HTMLElement | null = null;

  constructor(root: HTMLElement, onChange: (index: number, tileId: TileId) => void) {
    this.root = root;
    this.onChange = onChange;
  }

  render(rows: CorrectionRow[]): void {
    this.closePicker();
    this.root.innerHTML = '';
    if (rows.length === 0) return;

    const heading = document.createElement('h2');
    heading.textContent = '手動補正';
    this.root.appendChild(heading);

    const hint = document.createElement('p');
    hint.className = 'correction-hint';
    hint.textContent = 'スロットをタップして牌を選択';
    this.root.appendChild(hint);

    const list = document.createElement('div');
    list.className = 'correction-grid';

    for (const row of rows) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `correction-slot${row.id ? '' : ' correction-slot--unknown'}`;
      button.textContent = row.id ? tileLabel(row.id) : `#${row.index + 1} ?`;
      button.addEventListener('click', () => {
        this.openPicker(row.index, button);
      });
      list.appendChild(button);
    }

    this.root.appendChild(list);
  }

  private openPicker(index: number, anchor: HTMLElement): void {
    this.closePicker();

    const picker = document.createElement('div');
    picker.className = 'tile-picker';
    picker.innerHTML = '<p class="tile-picker-title">牌を選択</p>';

    const grid = document.createElement('div');
    grid.className = 'tile-picker-grid';

    for (const tile of ALL_TILES) {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'tile-picker-option';
      option.textContent = tileLabel(tile);
      option.addEventListener('click', () => {
        this.onChange(index, tile);
        this.closePicker();
      });
      grid.appendChild(option);
    }

    picker.appendChild(grid);
    anchor.after(picker);
    this.activePicker = picker;
  }

  private closePicker(): void {
    this.activePicker?.remove();
    this.activePicker = null;
  }
}
