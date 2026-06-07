import type { EfficiencyResult, TileId } from '../types/index.js';
import { HandValidationError } from '../types/index.js';
import { validateTiles } from './ukeire.js';
import {
  calculateEfficiencyWithTypeScript,
  calculateEfficiencyWithWasm,
  getWasmEfficiencyModule,
  loadWasmEfficiency,
} from './wasm-loader.js';

export { calcShanten } from './shanten.js';
export { ALL_TILES, tileLabel, tileUnicode } from './tiles.js';
export { calcDiscardCandidates, calcUkeireFor13 } from './ukeire.js';

export type EfficiencyCalculator = (tiles: TileId[]) => EfficiencyResult;

export function initEfficiencyEngine(): EfficiencyCalculator {
  void loadWasmEfficiency();
  return (tiles: TileId[]) => calculateEfficiency(tiles);
}

export function calculateEfficiency(tiles: TileId[]): EfficiencyResult {
  if (tiles.length < 1 || tiles.length > 14) {
    throw new HandValidationError('Hand must contain 1 to 14 tiles');
  }

  try {
    validateTiles(tiles);
  } catch (error) {
    throw new HandValidationError(error instanceof Error ? error.message : 'Invalid hand');
  }

  const wasm = getWasmEfficiencyModule();
  if (wasm) {
    try {
      return calculateEfficiencyWithWasm(tiles, wasm);
    } catch (error) {
      console.warn('[JanCame] WASM calculation failed, falling back to TypeScript', error);
    }
  }

  return calculateEfficiencyWithTypeScript(tiles);
}
