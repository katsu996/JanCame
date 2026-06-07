import { existsSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { calcShanten, calculateEfficiency } from '../../src/efficiency/index.js';
import { countsFromTiles } from '../../src/efficiency/tiles.js';
import {
  calculateEfficiencyWithTypeScript,
  getWasmEfficiencyModule,
  loadWasmEfficiency,
} from '../../src/efficiency/wasm-loader.js';
import type { TileId } from '../../src/types/index.js';

const wasmBuilt = existsSync('pkg/tile-efficiency-wasm/tile_efficiency_wasm.js');

const fixtures: TileId[][] = [
  ['1m', '2m', '3m', '4m', '5m', '6m', '7p', '8p', '9p', '5s', '5s', '5s', '9m'],
  ['E', 'E', 'E', '1m', '2m', '3m', '4p', '5p', '6p', '7s', '8s', '9s', 'P', 'P'],
  ['1m', '2m', '3m', '4m', '5m', '6m', '7p', '8p', '9p', '5s', '5s', '5s', '9m', '9m'],
  ['2m', '3m', '4m', '5m', '6m', '7m', '2p', '3p', '4p', '6s', '7s', '8s', '9s', '9s'],
];

describe('wasm efficiency', () => {
  beforeAll(async () => {
    if (wasmBuilt) {
      await loadWasmEfficiency();
    }
  });

  it('wasm artifact exists after build:wasm', () => {
    expect(wasmBuilt).toBe(true);
  });

  it('matches TypeScript shanten for fixtures', () => {
    if (!wasmBuilt) return;

    const wasm = getWasmEfficiencyModule();
    expect(wasm).not.toBeNull();

    for (const tiles of fixtures) {
      const ts = calcShanten(countsFromTiles(tiles));
      expect(wasm!.calc_shanten_wasm(tiles)).toBe(ts);
    }
  });

  it('matches TypeScript efficiency output for fixtures', () => {
    if (!wasmBuilt) return;

    for (const tiles of fixtures) {
      const tsResult = calculateEfficiencyWithTypeScript(tiles);
      const result = calculateEfficiency(tiles);
      expect(result.shanten).toBe(tsResult.shanten);
      expect(result.candidates.length).toBe(tsResult.candidates.length);
      for (let index = 0; index < result.candidates.length; index++) {
        expect(result.candidates[index]).toEqual(tsResult.candidates[index]);
      }
    }
  });
});
