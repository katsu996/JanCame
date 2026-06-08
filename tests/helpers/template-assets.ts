import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { ALL_TILES } from '../../src/efficiency/tiles.js';
import type { PixelSurface } from '../../src/recognition/match.js';
import { TEMPLATE_HEIGHT, TEMPLATE_WIDTH } from '../../src/recognition/templates.js';
import type { TileId } from '../../src/types/index.js';

const ASSET_DIR = join(process.cwd(), 'public/assets/tiles');

export function assetTemplatesExist(): boolean {
  return ALL_TILES.every((tile) => existsSync(join(ASSET_DIR, `${tile}.png`)));
}

export async function loadAssetSurfaces(): Promise<Array<{ id: TileId; surface: PixelSurface }>> {
  const templates: Array<{ id: TileId; surface: PixelSurface }> = [];

  for (const id of ALL_TILES) {
    const path = join(ASSET_DIR, `${id}.png`);
    const bytes = readFileSync(path);
    const image = await loadImage(bytes);
    const canvas = createCanvas(TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    const imageData = context.getImageData(0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
    templates.push({
      id,
      surface: {
        width: TEMPLATE_WIDTH,
        height: TEMPLATE_HEIGHT,
        data: new Uint8ClampedArray(imageData.data),
      },
    });
  }

  return templates;
}

export async function buildHandSurface(
  tiles: TileId[],
  _templates: Array<{ id: TileId; surface: PixelSurface }>,
): Promise<PixelSurface> {
  const gap = 0;
  const width = tiles.length * TEMPLATE_WIDTH + (tiles.length - 1) * gap;
  const height = TEMPLATE_HEIGHT;
  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  context.fillStyle = '#1b5e20';
  context.fillRect(0, 0, width, height);

  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    const bytes = readFileSync(join(ASSET_DIR, `${tile}.png`));
    const image = await loadImage(bytes);
    context.drawImage(image, index * (TEMPLATE_WIDTH + gap), 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  }

  const imageData = context.getImageData(0, 0, width, height);
  return {
    width,
    height,
    data: new Uint8ClampedArray(imageData.data),
  };
}

export async function buildFullFrameSurface(tiles: TileId[]): Promise<PixelSurface> {
  const frameCanvas = createCanvas(1280, 720);
  const frameContext = frameCanvas.getContext('2d');
  frameContext.fillStyle = '#111';
  frameContext.fillRect(0, 0, frameCanvas.width, frameCanvas.height);

  const composedHand = createCanvas(tiles.length * TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  const composedContext = composedHand.getContext('2d');
  composedContext.fillStyle = '#1b5e20';
  composedContext.fillRect(0, 0, composedHand.width, composedHand.height);

  for (let index = 0; index < tiles.length; index++) {
    const tile = tiles[index];
    const bytes = readFileSync(join(ASSET_DIR, `${tile}.png`));
    const image = await loadImage(bytes);
    composedContext.drawImage(image, index * TEMPLATE_WIDTH, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  }

  frameContext.drawImage(composedHand, 80, 280);

  const imageData = frameContext.getImageData(0, 0, frameCanvas.width, frameCanvas.height);
  return {
    width: frameCanvas.width,
    height: frameCanvas.height,
    data: new Uint8ClampedArray(imageData.data),
  };
}

export function cropSurface(source: PixelSurface, x: number, width: number): PixelSurface {
  const data = new Uint8ClampedArray(width * source.height * 4);
  for (let row = 0; row < source.height; row++) {
    for (let col = 0; col < width; col++) {
      const sourceIndex = (row * source.width + (x + col)) * 4;
      const targetIndex = (row * width + col) * 4;
      data[targetIndex] = source.data[sourceIndex];
      data[targetIndex + 1] = source.data[sourceIndex + 1];
      data[targetIndex + 2] = source.data[sourceIndex + 2];
      data[targetIndex + 3] = source.data[sourceIndex + 3];
    }
  }
  return { width, height: source.height, data };
}

export function surfaceToImageData(surface: PixelSurface): ImageData {
  ensureImageDataPolyfill();
  return new ImageData(surface.data, surface.width, surface.height);
}

export async function loadAssetTemplates(): Promise<
  Array<{ id: TileId; source: 'asset'; surface: PixelSurface; canvas: HTMLCanvasElement }>
> {
  const surfaces = await loadAssetSurfaces();
  return surfaces.map(({ id, surface }) => ({
    id,
    source: 'asset' as const,
    surface,
    canvas: null as unknown as HTMLCanvasElement,
  }));
}

function ensureImageDataPolyfill(): void {
  if (typeof ImageData === 'undefined') {
    globalThis.ImageData = class {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
        if (typeof dataOrWidth === 'number') {
          this.width = dataOrWidth;
          this.height = widthOrHeight;
          this.data = new Uint8ClampedArray(this.width * this.height * 4);
          return;
        }
        this.data = dataOrWidth;
        this.width = widthOrHeight;
        this.height = height ?? 0;
      }
    } as typeof ImageData;
  }
}
