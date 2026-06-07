import { canFormSequence, isNumberTileIndex } from './tiles.js';

function chiitoitsuShanten(counts: number[]): number {
  let pairs = 0;
  let kinds = 0;

  for (let index = 0; index < counts.length; index++) {
    if (counts[index] >= 1) kinds++;
    if (counts[index] >= 2) pairs++;
  }

  return 6 - pairs + Math.max(0, kinds - 7);
}

function normalShanten(counts: number[]): number {
  const tiles = [...counts];
  let minShanten = 8;

  const evaluate = (melds: number, pair: boolean, taatsu: number): void => {
    let shanten = 8 - melds * 2 - (pair ? 1 : 0) - taatsu;
    const groups = melds + taatsu;
    if (groups > 4) {
      shanten += groups - 4;
    }
    minShanten = Math.min(minShanten, shanten);
  };

  const search = (index: number, melds: number, pair: boolean, taatsu: number): void => {
    let cursor = index;
    while (cursor < tiles.length && tiles[cursor] === 0) {
      cursor++;
    }

    if (cursor === tiles.length) {
      evaluate(melds, pair, taatsu);
      return;
    }

    if (melds + taatsu >= 4) {
      evaluate(melds, pair, taatsu);
    }

    if (!pair && tiles[cursor] >= 2) {
      tiles[cursor] -= 2;
      search(cursor, melds, true, taatsu);
      tiles[cursor] += 2;
    }

    if (tiles[cursor] >= 3) {
      tiles[cursor] -= 3;
      search(cursor, melds + 1, pair, taatsu);
      tiles[cursor] += 3;
    }

    if (canFormSequence(cursor) && tiles[cursor + 1] > 0 && tiles[cursor + 2] > 0) {
      tiles[cursor]--;
      tiles[cursor + 1]--;
      tiles[cursor + 2]--;
      search(cursor, melds + 1, pair, taatsu);
      tiles[cursor]++;
      tiles[cursor + 1]++;
      tiles[cursor + 2]++;
    }

    if (melds + taatsu < 4) {
      if (canFormSequence(cursor) && tiles[cursor + 1] > 0) {
        tiles[cursor]--;
        tiles[cursor + 1]--;
        search(cursor, melds, pair, taatsu + 1);
        tiles[cursor]++;
        tiles[cursor + 1]++;
      }

      if (canFormSequence(cursor) && tiles[cursor + 2] > 0) {
        tiles[cursor]--;
        tiles[cursor + 2]--;
        search(cursor, melds, pair, taatsu + 1);
        tiles[cursor]++;
        tiles[cursor + 2]++;
      }

      if (pair && tiles[cursor] >= 2) {
        tiles[cursor] -= 2;
        search(cursor, melds, pair, taatsu + 1);
        tiles[cursor] += 2;
      }

      if (isNumberTileIndex(cursor) && cursor % 9 === 0 && tiles[cursor + 1] > 0) {
        tiles[cursor + 1]--;
        search(cursor + 2, melds, pair, taatsu + 1);
        tiles[cursor + 1]++;
      }

      if (isNumberTileIndex(cursor) && cursor % 9 === 7 && tiles[cursor + 1] > 0) {
        tiles[cursor + 1]--;
        search(cursor, melds, pair, taatsu + 1);
        tiles[cursor + 1]++;
      }
    }

    search(cursor + 1, melds, pair, taatsu);
  };

  search(0, 0, false, 0);
  return minShanten;
}

export function calcShanten(counts: number[]): number {
  return Math.min(normalShanten(counts), chiitoitsuShanten(counts));
}
