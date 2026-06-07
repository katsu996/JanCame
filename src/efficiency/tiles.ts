import type { TileId } from '../types/index.js';

export const TILE_COUNT = 34;

export const ALL_TILES: readonly TileId[] = [
  '1m',
  '2m',
  '3m',
  '4m',
  '5m',
  '6m',
  '7m',
  '8m',
  '9m',
  '1p',
  '2p',
  '3p',
  '4p',
  '5p',
  '6p',
  '7p',
  '8p',
  '9p',
  '1s',
  '2s',
  '3s',
  '4s',
  '5s',
  '6s',
  '7s',
  '8s',
  '9s',
  'E',
  'S',
  'W',
  'N',
  'P',
  'F',
  'C',
] as const;

const TILE_INDEX = new Map<TileId, number>(ALL_TILES.map((tile, index) => [tile, index]));

export function tileToIndex(tile: TileId): number {
  const index = TILE_INDEX.get(tile);
  if (index === undefined) {
    throw new Error(`Unknown tile: ${tile}`);
  }
  return index;
}

export function indexToTile(index: number): TileId {
  const tile = ALL_TILES[index];
  if (!tile) {
    throw new Error(`Invalid tile index: ${index}`);
  }
  return tile;
}

export function createEmptyCounts(): number[] {
  return Array.from({ length: TILE_COUNT }, () => 0);
}

export function countsFromTiles(tiles: TileId[]): number[] {
  const counts = createEmptyCounts();
  for (const tile of tiles) {
    counts[tileToIndex(tile)]++;
  }
  return counts;
}

export function tilesFromCounts(counts: number[]): TileId[] {
  const tiles: TileId[] = [];
  for (let index = 0; index < TILE_COUNT; index++) {
    for (let count = 0; count < counts[index]; count++) {
      tiles.push(indexToTile(index));
    }
  }
  return tiles;
}

export function isNumberTileIndex(index: number): boolean {
  return index < 27;
}

export function canFormSequence(index: number): boolean {
  return isNumberTileIndex(index) && index % 9 <= 6;
}

export function tileLabel(tile: TileId): string {
  return tile;
}

export function tileUnicode(tile: TileId): string {
  const map: Record<TileId, string> = {
    '1m': '🀇',
    '2m': '🀈',
    '3m': '🀉',
    '4m': '🀊',
    '5m': '🀋',
    '6m': '🀌',
    '7m': '🀍',
    '8m': '🀎',
    '9m': '🀏',
    '1p': '🀙',
    '2p': '🀚',
    '3p': '🀛',
    '4p': '🀜',
    '5p': '🀝',
    '6p': '🀞',
    '7p': '🀟',
    '8p': '🀠',
    '9p': '🀡',
    '1s': '🀐',
    '2s': '🀑',
    '3s': '🀒',
    '4s': '🀓',
    '5s': '🀔',
    '6s': '🀕',
    '7s': '🀖',
    '8s': '🀗',
    '9s': '🀘',
    E: '🀀',
    S: '🀁',
    W: '🀂',
    N: '🀃',
    P: '🀆',
    F: '🀅',
    C: '🀄',
  };
  return map[tile];
}
