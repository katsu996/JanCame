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
    await wasm.default();
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

/** @internal Vitest から WASM モジュールを注入する */
export function setWasmEfficiencyModuleForTests(module: unknown): void {
  wasmModule = module as WasmEfficiencyModule;
  loadAttempted = true;
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
