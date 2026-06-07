export type Suit = 'm' | 'p' | 's';

export type NumberTileId = `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${Suit}`;

export type HonorTileId = 'E' | 'S' | 'W' | 'N' | 'P' | 'F' | 'C';

export type TileId = NumberTileId | HonorTileId;

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RecognizedTile {
  id: TileId | null;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface RecognitionResult {
  tiles: RecognizedTile[];
  timestamp: number;
  frameId: number;
}

export interface DiscardCandidate {
  tile: TileId;
  shantenAfter: number;
  ukeireTiles: TileId[];
  ukeireCount: number;
}

export interface EfficiencyResult {
  shanten: number;
  candidates: DiscardCandidate[];
}

export interface RoiRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface RoiQuad {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export class HandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HandValidationError';
  }
}
