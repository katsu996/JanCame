# Delta for tile-efficiency

## ADDED Requirements

### Requirement: WASM 牌効率エンジン

The system SHALL provide tile efficiency calculation via a Rust WebAssembly module compiled with wasm-pack.

#### Scenario: WASM 正常ロード

- **GIVEN** the WASM module is available in the build output
- **WHEN** the app initializes the efficiency module
- **THEN** shanten and discard candidate calculations use the WASM engine

#### Scenario: WASM ロード失敗

- **GIVEN** the WASM module fails to load
- **WHEN** efficiency calculation is requested
- **THEN** the system falls back to the TypeScript implementation
- **AND** a console warning is logged

### Requirement: WASM と TS の結果一致

The system SHALL verify that WASM and TypeScript implementations produce identical results for all existing unit test fixtures.

#### Scenario: 回帰テスト一致

- **GIVEN** a fixture hand from the existing test suite
- **WHEN** both WASM and TS calculate shanten and discard candidates
- **THEN** the results match for shanten, ukeireTiles, and ukeireCount

## MODIFIED Requirements

### Requirement: 牌効率モジュールのテスト可能性

The system SHALL provide unit tests for shanten and ukeire calculation with at least 10 known hand fixtures, covering both TypeScript and WASM implementations.

#### Scenario: 回帰テスト

- **GIVEN** a fixture hand with a known shanten value
- **WHEN** the unit test runs
- **THEN** the calculated shanten matches the expected value

#### Scenario: WASM 一致テスト

- **GIVEN** a fixture hand
- **WHEN** WASM and TS both calculate efficiency
- **THEN** the outputs are identical
