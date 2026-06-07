import type { EfficiencyResult, TileId } from '../types/index.js';
import { calcEfficiencyForTiles } from './ukeire.js';

interface WasmEfficiencyModule {
  calc_efficiency(tiles: TileId[]): EfficiencyResult;
  calc_shanten_wasm(tiles: TileId[]): number;
}

let wasmModule: WasmEfficiencyModule | null = null;
let loadAttempted = false;

export async function loadWasmEfficiency(): Promise<WasmEfficiencyModule | null> {
  if (wasmModule) return wasmModule;
  if (loadAttempted) return null;
  loadAttempted = true;

  try {
    const wasm = await import('../../pkg/tile-efficiency-wasm/tile_efficiency_wasm.js');
    if (import.meta.env.VITEST) {
      const [{ readFileSync }, { dirname, join }, { fileURLToPath }] = await Promise.all([
        import('node:fs'),
        import('node:path'),
        import('node:url'),
      ]);
      const wasmDir = join(
        dirname(fileURLToPath(import.meta.url)),
        '../../pkg/tile-efficiency-wasm',
      );
      const wasmBytes = readFileSync(join(wasmDir, 'tile_efficiency_wasm_bg.wasm'));
      await wasm.default(wasmBytes);
    } else {
      await wasm.default();
    }
    wasmModule = wasm as unknown as WasmEfficiencyModule;
    return wasmModule;
  } catch (error) {
    console.warn('[JanCame] WASM efficiency module unavailable, using TypeScript fallback', error);
    return null;
  }
}

export function getWasmEfficiencyModule(): WasmEfficiencyModule | null {
  return wasmModule;
}

export function calculateEfficiencyWithWasm(
  tiles: TileId[],
  wasm: WasmEfficiencyModule,
): EfficiencyResult {
  return wasm.calc_efficiency(tiles) as EfficiencyResult;
}

export function calculateEfficiencyWithTypeScript(tiles: TileId[]): EfficiencyResult {
  return calcEfficiencyForTiles(tiles);
}
