import { existsSync, readFileSync } from 'node:fs';
import { setWasmEfficiencyModuleForTests } from '../../src/efficiency/wasm-loader.js';

const WASM_JS = 'pkg/tile-efficiency-wasm/tile_efficiency_wasm.js';
const WASM_BG = 'pkg/tile-efficiency-wasm/tile_efficiency_wasm_bg.wasm';

export function isWasmBuilt(): boolean {
  return existsSync(WASM_JS);
}

export async function loadWasmForTests(): Promise<void> {
  const wasm = await import('../../pkg/tile-efficiency-wasm/tile_efficiency_wasm.js');
  const wasmBytes = readFileSync(WASM_BG);
  await wasm.default(wasmBytes);
  setWasmEfficiencyModuleForTests(wasm);
}
