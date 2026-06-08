/**
 * @vitest-environment node
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { MATCH_THRESHOLD, matchTileSurface } from '../../src/recognition/match.js';
import { TEMPLATE_WIDTH } from '../../src/recognition/templates.js';
import type { TileId } from '../../src/types/index.js';
import {
  assetTemplatesExist,
  buildHandSurface,
  cropSurface,
  loadAssetSurfaces,
} from '../helpers/template-assets.js';

describe('tile matching', () => {
  let templates: Awaited<ReturnType<typeof loadAssetSurfaces>>;

  beforeAll(async () => {
    templates = await loadAssetSurfaces();
  });

  it('loads 34 PNG template assets', () => {
    expect(assetTemplatesExist()).toBe(true);
    expect(templates).toHaveLength(34);
  });

  it('recognizes each template against itself', () => {
    for (const template of templates) {
      const result = matchTileSurface(template.surface, templates);
      expect(result.id).toBe(template.id);
      expect(result.confidence).toBeGreaterThanOrEqual(MATCH_THRESHOLD);
    }
  });

  it('recognizes a composed 14-tile hand', async () => {
    const handTiles: TileId[] = [
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
    const hand = await buildHandSurface(handTiles, templates);
    let recognized = 0;

    for (let index = 0; index < handTiles.length; index++) {
      const x = index * TEMPLATE_WIDTH;
      const slot = cropSurface(hand, x, TEMPLATE_WIDTH);
      const result = matchTileSurface(slot, templates);
      if (result.id === handTiles[index]) recognized++;
    }

    expect(recognized).toBeGreaterThanOrEqual(10);
  });
});
