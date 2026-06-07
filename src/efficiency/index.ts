import type { EfficiencyResult, TileId } from '../types/index.js';
import { HandValidationError } from '../types/index.js';
import { calcEfficiencyForTiles, validateTiles } from './ukeire.js';

export { calcShanten } from './shanten.js';
export { ALL_TILES, tileLabel, tileUnicode } from './tiles.js';
export { calcDiscardCandidates, calcUkeireFor13 } from './ukeire.js';

export function calculateEfficiency(tiles: TileId[]): EfficiencyResult {
  if (tiles.length < 1 || tiles.length > 14) {
    throw new HandValidationError('Hand must contain 1 to 14 tiles');
  }

  try {
    validateTiles(tiles);
  } catch (error) {
    throw new HandValidationError(error instanceof Error ? error.message : 'Invalid hand');
  }

  return calcEfficiencyForTiles(tiles);
}
