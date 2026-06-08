/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { calcShanten, calculateEfficiency } from '../../src/efficiency/index.js';
import { countsFromTiles } from '../../src/efficiency/tiles.js';
import type { TileId } from '../../src/types/index.js';

function shanten(tiles: TileId[]): number {
  return calcShanten(countsFromTiles(tiles));
}

describe('shanten', () => {
  it('returns -1 for complete 14-tile hand', () => {
    const tiles: TileId[] = [
      'E',
      'E',
      'E',
      '1m',
      '2m',
      '3m',
      '4p',
      '5p',
      '6p',
      '7s',
      '8s',
      '9s',
      'P',
      'P',
    ];
    expect(shanten(tiles)).toBe(-1);
  });

  it('returns 0 for tenpai hand', () => {
    const tiles: TileId[] = [
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
    ];
    expect(shanten(tiles)).toBe(0);
  });

  it('returns 1 for one-shanten hand', () => {
    const tiles: TileId[] = [
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
      '9s',
      '9m',
    ];
    expect(shanten(tiles)).toBe(1);
  });

  it('returns 0 for chiitoitsu tenpai', () => {
    const tiles: TileId[] = [
      '1m',
      '1m',
      '3p',
      '3p',
      '5s',
      '5s',
      '7m',
      '7m',
      '9p',
      '9p',
      'E',
      'E',
      'S',
    ];
    expect(shanten(tiles)).toBe(0);
  });

  it('prefers normal shape over chiitoitsu for mixed hand', () => {
    const tiles: TileId[] = [
      '1m',
      '2m',
      '3m',
      '4p',
      '5p',
      '6p',
      '7s',
      '8s',
      '9s',
      'E',
      'S',
      'W',
      'N',
    ];
    expect(shanten(tiles)).toBe(2);
  });

  it('returns high shanten for scattered hand', () => {
    const tiles: TileId[] = [
      '1m',
      '3m',
      '5m',
      '7m',
      '9m',
      '2p',
      '4p',
      '6p',
      '8p',
      '1s',
      '3s',
      '5s',
      '7s',
    ];
    expect(shanten(tiles)).toBeGreaterThanOrEqual(4);
  });

  it('handles honor triplets in complete hand', () => {
    const tiles: TileId[] = [
      'E',
      'E',
      'E',
      '1m',
      '2m',
      '3m',
      '4p',
      '5p',
      '6p',
      '7s',
      '8s',
      '9s',
      'P',
      'P',
    ];
    expect(shanten(tiles)).toBe(-1);
  });

  it('handles mixed waits', () => {
    const tiles: TileId[] = [
      '2m',
      '3m',
      '4m',
      '5m',
      '6m',
      '7m',
      '2p',
      '3p',
      '4p',
      '6s',
      '7s',
      '8s',
      '9s',
      '9s',
    ];
    const result = calculateEfficiency(tiles);
    expect(result.shanten).toBe(0);
    expect(result.candidates.length).toBeGreaterThan(0);
  });
});

describe('calculateEfficiency', () => {
  it('rejects invalid tile counts', () => {
    expect(() => calculateEfficiency(['1m', '1m', '1m', '1m', '1m'])).toThrow();
  });

  it('returns discard candidates for 14 tiles sorted by ukeire', () => {
    const tiles: TileId[] = [
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
      '9m',
    ];
    const result = calculateEfficiency(tiles);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].ukeireCount).toBeGreaterThanOrEqual(
      result.candidates[result.candidates.length - 1].ukeireCount,
    );
  });

  it('calculates ukeire for tenpai discard', () => {
    const tiles: TileId[] = [
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
    const result = calculateEfficiency(tiles);
    const discard9m = result.candidates.find((candidate) => candidate.tile === '9m');
    expect(discard9m).toBeDefined();
    expect(discard9m?.shantenAfter).toBe(0);
    expect(discard9m?.ukeireCount).toBeGreaterThan(0);
  });

  it('returns shanten only for 13 tiles', () => {
    const tiles: TileId[] = [
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
    ];
    const result = calculateEfficiency(tiles);
    expect(result.shanten).toBe(0);
    expect(result.candidates).toEqual([]);
  });

  it('handles two-sided wait example', () => {
    const tiles: TileId[] = [
      '2m',
      '3m',
      '4m',
      '5m',
      '6m',
      '7m',
      '2p',
      '3p',
      '4p',
      '6s',
      '7s',
      '8s',
      '5s',
      '5s',
    ];
    const result = calculateEfficiency(tiles);
    expect(result.shanten).toBeLessThanOrEqual(1);
  });

  it('handles pinfu-like shape', () => {
    const tiles: TileId[] = [
      '2m',
      '3m',
      '4m',
      '6m',
      '7m',
      '8m',
      '2p',
      '3p',
      '4p',
      '6p',
      '7p',
      '8p',
      '5s',
      '5s',
    ];
    const result = calculateEfficiency(tiles);
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it('handles all honors and terminals', () => {
    const tiles: TileId[] = [
      '1m',
      '9m',
      '1p',
      '9p',
      '1s',
      '9s',
      'E',
      'S',
      'W',
      'N',
      'P',
      'F',
      'C',
      'C',
    ];
    expect(() => calculateEfficiency(tiles)).not.toThrow();
  });

  it('handles seven pairs one away', () => {
    const tiles: TileId[] = [
      '1m',
      '1m',
      '3p',
      '3p',
      '5s',
      '5s',
      '7m',
      '7m',
      '9p',
      '9p',
      'E',
      'E',
      'S',
      'W',
    ];
    const result = calculateEfficiency(tiles);
    expect(result.shanten).toBeLessThanOrEqual(2);
  });

  it('validates max 4 copies', () => {
    const tiles: TileId[] = [
      '5m',
      '5m',
      '5m',
      '5m',
      '5m',
      '1p',
      '2p',
      '3p',
      '4p',
      '6p',
      '7p',
      '8p',
      '9p',
      '9p',
    ];
    expect(() => calculateEfficiency(tiles)).toThrow();
  });
});
