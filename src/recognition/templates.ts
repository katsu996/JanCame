import { ALL_TILES, tileUnicode } from '../efficiency/tiles.js';
import type { TileId } from '../types/index.js';
import type { CvMat } from './opencv.d.js';

export const TEMPLATE_WIDTH = 48;
export const TEMPLATE_HEIGHT = 64;
export const TILE_ASSET_BASE = `${import.meta.env.BASE_URL}assets/tiles`;

export type TileTemplateSource = 'asset' | 'generated';

export interface TileTemplate {
  id: TileId;
  canvas: HTMLCanvasElement;
  source: TileTemplateSource;
  surface?: import('./match.js').PixelSurface;
}

const templateMatCache = new WeakMap<TileTemplate, CvMat>();

export function getTemplateMat(template: TileTemplate): CvMat | undefined {
  return templateMatCache.get(template);
}

export function setTemplateMat(template: TileTemplate, mat: CvMat): void {
  templateMatCache.set(template, mat);
}

export function clearTemplateMatCache(templates: TileTemplate[]): void {
  for (const template of templates) {
    const mat = templateMatCache.get(template);
    mat?.delete();
    templateMatCache.delete(template);
  }
}

function drawGeneratedTemplate(tile: TileId): HTMLCanvasElement {
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

async function loadAssetTemplate(tile: TileId): Promise<TileTemplate | null> {
  try {
    const response = await fetch(`${TILE_ASSET_BASE}/${tile}.png`);
    if (!response.ok) return null;

    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = TEMPLATE_WIDTH;
    canvas.height = TEMPLATE_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.drawImage(bitmap, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    bitmap.close();
    return { id: tile, canvas, source: 'asset' };
  } catch {
    return null;
  }
}

export function generateTileTemplates(): TileTemplate[] {
  return ALL_TILES.map((id) => ({
    id,
    canvas: drawGeneratedTemplate(id),
    source: 'generated' as const,
  }));
}

export async function loadTileTemplates(): Promise<TileTemplate[]> {
  const templates: TileTemplate[] = [];
  let assetCount = 0;

  for (const id of ALL_TILES) {
    const assetTemplate = await loadAssetTemplate(id);
    if (assetTemplate) {
      templates.push(assetTemplate);
      assetCount++;
      continue;
    }

    templates.push({
      id,
      canvas: drawGeneratedTemplate(id),
      source: 'generated',
    });
  }

  if (assetCount < ALL_TILES.length) {
    console.warn(
      `[JanCame] Tile template assets incomplete (${assetCount}/${ALL_TILES.length}). Using generated fallback for missing tiles.`,
    );
  }

  return templates;
}

export function getTemplateSize(): { width: number; height: number } {
  return { width: TEMPLATE_WIDTH, height: TEMPLATE_HEIGHT };
}

export async function loadImageFromUrl(url: string): Promise<HTMLCanvasElement> {
  const response = await fetch(url);
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0);
  bitmap.close();
  return canvas;
}
