/**
 * Generate 34 mahjong-style tile PNG templates for template matching.
 * Usage: node scripts/generate-tile-templates.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';

const ALL_TILES = [
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
];

const PIN_COLORS = ['#2563eb', '#dc2626', '#16a34a'];
const WIDTH = 48;
const HEIGHT = 64;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/assets/tiles');

function drawTileFace(ctx, tile) {
  ctx.fillStyle = '#1b5e20';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = '#f7f1df';
  ctx.fillRect(3, 2, WIDTH - 6, HEIGHT - 4);
  ctx.strokeStyle = '#c8b98a';
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 3, WIDTH - 8, HEIGHT - 6);

  const suit = tile.slice(-1);
  const value = tile.slice(0, -1);

  if (suit === 'm') {
    drawPinCircles(ctx, Number(value), ['#b91c1c']);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(8, HEIGHT - 14, WIDTH - 16, 4);
    return;
  }

  if (suit === 'p') {
    drawPinCircles(ctx, Number(value));
    return;
  }

  if (suit === 's') {
    drawSouBamboo(ctx, Number(value));
    return;
  }

  drawHonorGlyph(ctx, tile);
}

function drawHonorGlyph(ctx, tile) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  switch (tile) {
    case 'E':
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 12, cy - 10, 24, 5);
      ctx.fillRect(cx - 12, cy - 10, 5, 20);
      ctx.fillRect(cx - 12, cy + 1, 18, 5);
      break;
    case 'S':
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 12, cy + 5, 24, 5);
      ctx.fillRect(cx + 7, cy - 10, 5, 20);
      ctx.fillRect(cx - 6, cy - 6, 18, 5);
      break;
    case 'W':
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 12, cy - 10, 24, 5);
      ctx.fillRect(cx + 7, cy - 10, 5, 20);
      ctx.fillRect(cx - 12, cy + 1, 18, 5);
      break;
    case 'N':
      ctx.fillStyle = '#111';
      ctx.fillRect(cx - 12, cy - 10, 24, 5);
      ctx.fillRect(cx - 12, cy - 10, 5, 20);
      ctx.fillRect(cx - 6, cy - 6, 18, 5);
      break;
    case 'P':
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case 'F':
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 12);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx - 12, cy);
      ctx.closePath();
      ctx.fill();
      break;
    case 'C':
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    default:
      break;
  }
}

function drawPinCircles(ctx, count, colors = PIN_COLORS) {
  const positions = {
    1: [[0, 0]],
    2: [
      [-8, -8],
      [8, 8],
    ],
    3: [
      [-8, 8],
      [0, 0],
      [8, -8],
    ],
    4: [
      [-8, -8],
      [8, -8],
      [-8, 8],
      [8, 8],
    ],
    5: [
      [-8, -8],
      [8, -8],
      [0, 0],
      [-8, 8],
      [8, 8],
    ],
    6: [
      [-8, -10],
      [0, -10],
      [8, -10],
      [-8, 8],
      [0, 8],
      [8, 8],
    ],
    7: [
      [-8, -12],
      [0, -12],
      [8, -12],
      [-8, 0],
      [0, 0],
      [8, 0],
      [0, 12],
    ],
    8: [
      [-8, -12],
      [0, -12],
      [8, -12],
      [-8, 0],
      [8, 0],
      [-8, 12],
      [0, 12],
      [8, 12],
    ],
    9: [
      [-8, -12],
      [0, -12],
      [8, -12],
      [-8, 0],
      [0, 0],
      [8, 0],
      [-8, 12],
      [0, 12],
      [8, 12],
    ],
  };

  for (const [dx, dy] of positions[count]) {
    ctx.beginPath();
    ctx.fillStyle = colors[(Math.abs(dx) + Math.abs(dy)) % colors.length];
    ctx.arc(WIDTH / 2 + dx, HEIGHT / 2 + dy, count === 1 ? 9 : 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSouBamboo(ctx, count) {
  if (count === 1) {
    ctx.fillStyle = '#15803d';
    ctx.fillRect(WIDTH / 2 - 3, 12, 6, 36);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(WIDTH / 2 - 1, 14, 2, 32);
    return;
  }

  const cols = count <= 3 ? count : 3;
  const rows = Math.ceil(count / cols);
  const startX = WIDTH / 2 - ((cols - 1) * 8) / 2;
  const startY = HEIGHT / 2 - ((rows - 1) * 10) / 2;

  for (let index = 0; index < count; index++) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = startX + col * 8;
    const y = startY + row * 10;
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x - 2, y - 8, 4, 16);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(x - 1, y - 7, 2, 14);
  }
}

mkdirSync(outDir, { recursive: true });

for (const tile of ALL_TILES) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  drawTileFace(ctx, tile);
  writeFileSync(join(outDir, `${tile}.png`), canvas.toBuffer('image/png'));
}

console.log(`Generated ${ALL_TILES.length} templates in ${outDir}`);
