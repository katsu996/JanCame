/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { runRecognitionPipeline } from '../../src/recognition/pipeline.js';
import type { TileId } from '../../src/types/index.js';
import {
  buildFullFrameSurface,
  loadAssetTemplates,
  surfaceToImageData,
} from '../helpers/template-assets.js';

const HAND: TileId[] = [
  '1m',
  '2m',
  '3m',
  '4m',
  '5m',
  '6m',
  '7p',
  '8p',
  '9p',
  '5s',
  '5s',
  '5s',
  '9m',
  '1p',
];

describe('recognition pipeline', () => {
  it('recognizes at least 10 tiles in a synthetic hand fixture', async () => {
    const frameSurface = await buildFullFrameSurface(HAND);
    const frame = surfaceToImageData(frameSurface);
    const handWidth = HAND.length * 48;
    const quad = {
      topLeft: { x: 80, y: 280 },
      topRight: { x: 80 + handWidth, y: 280 },
      bottomRight: { x: 80 + handWidth, y: 344 },
      bottomLeft: { x: 80, y: 344 },
    };
    const templates = await loadAssetTemplates();
    const result = runRecognitionPipeline(frame, {
      cv: null,
      templates,
      quad,
      frameId: 1,
    });

    expect(result.tiles.length).toBe(14);
    const recognized = result.tiles.filter(
      (tile, index) => tile.id === HAND[index] && tile.confidence > 0,
    ).length;
    expect(recognized).toBeGreaterThanOrEqual(10);
  });
});
