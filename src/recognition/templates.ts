import { ALL_TILES, tileUnicode } from '../efficiency/tiles.js';
import type { TileId } from '../types/index.js';

const TEMPLATE_WIDTH = 48;
const TEMPLATE_HEIGHT = 64;

export interface TileTemplate {
  id: TileId;
  canvas: HTMLCanvasElement;
}

function drawTemplate(tile: TileId): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = TEMPLATE_WIDTH;
  canvas.height = TEMPLATE_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to create template canvas');
  }

  context.fillStyle = '#f5f0e6';
  context.fillRect(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  context.strokeStyle = '#333';
  context.lineWidth = 2;
  context.strokeRect(2, 2, TEMPLATE_WIDTH - 4, TEMPLATE_HEIGHT - 4);

  context.fillStyle = '#111';
  context.font = '28px serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(tileUnicode(tile), TEMPLATE_WIDTH / 2, TEMPLATE_HEIGHT / 2 - 6);

  context.font = '11px sans-serif';
  context.fillText(tile, TEMPLATE_WIDTH / 2, TEMPLATE_HEIGHT - 12);

  return canvas;
}

export function generateTileTemplates(): TileTemplate[] {
  return ALL_TILES.map((id) => ({
    id,
    canvas: drawTemplate(id),
  }));
}

export async function loadTileTemplates(): Promise<TileTemplate[]> {
  return generateTileTemplates();
}

export function getTemplateSize(): { width: number; height: number } {
  return { width: TEMPLATE_WIDTH, height: TEMPLATE_HEIGHT };
}
