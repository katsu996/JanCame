import type { DiscardCandidate, TileId } from '../types/index.js';
import { calcShanten } from './shanten.js';
import { ALL_TILES, countsFromTiles, indexToTile, tileToIndex } from './tiles.js';

function remainingCount(counts: number[], index: number): number {
  return Math.max(0, 4 - counts[index]);
}

export function calcUkeireFor13(counts: number[]): { tiles: TileId[]; count: number } {
  const baseShanten = calcShanten(counts);
  const ukeireTiles: TileId[] = [];
  let ukeireCount = 0;

  for (let index = 0; index < counts.length; index++) {
    if (counts[index] >= 4) continue;

    counts[index]++;
    const nextShanten = calcShanten(counts);
    counts[index]--;

    if (nextShanten < baseShanten) {
      const tile = indexToTile(index);
      ukeireTiles.push(tile);
      ukeireCount += remainingCount(counts, index);
    }
  }

  return { tiles: ukeireTiles, count: ukeireCount };
}

export function calcDiscardCandidates(tiles: TileId[]): DiscardCandidate[] {
  const counts = countsFromTiles(tiles);
  const candidates: DiscardCandidate[] = [];
  const seen = new Set<number>();

  for (let index = 0; index < counts.length; index++) {
    if (counts[index] === 0 || seen.has(index)) continue;
    seen.add(index);

    counts[index]--;
    const shantenAfter = calcShanten(counts);
    const ukeire = calcUkeireFor13(counts);
    counts[index]++;

    candidates.push({
      tile: indexToTile(index),
      shantenAfter,
      ukeireTiles: ukeire.tiles,
      ukeireCount: ukeire.count,
    });
  }

  return candidates.sort((left, right) => {
    if (right.ukeireCount !== left.ukeireCount) {
      return right.ukeireCount - left.ukeireCount;
    }
    return left.shantenAfter - right.shantenAfter;
  });
}

export function calcEfficiencyForTiles(tiles: TileId[]): {
  shanten: number;
  candidates: DiscardCandidate[];
} {
  const counts = countsFromTiles(tiles);
  const total = tiles.length;

  if (total === 14) {
    const candidates = calcDiscardCandidates(tiles);
    const shanten =
      candidates.length > 0
        ? Math.min(...candidates.map((candidate) => candidate.shantenAfter))
        : calcShanten(counts);
    return { shanten, candidates };
  }

  if (total === 13) {
    return {
      shanten: calcShanten(counts),
      candidates: [],
    };
  }

  return {
    shanten: calcShanten(counts),
    candidates: [],
  };
}

export function getAllTileIds(): readonly TileId[] {
  return ALL_TILES;
}

export function validateTiles(tiles: TileId[]): void {
  const counts = countsFromTiles(tiles);
  for (let index = 0; index < counts.length; index++) {
    if (counts[index] > 4) {
      throw new Error(`Too many copies of ${indexToTile(index)}`);
    }
  }
}

export function sortTiles(tiles: TileId[]): TileId[] {
  return [...tiles].sort((left, right) => tileToIndex(left) - tileToIndex(right));
}
