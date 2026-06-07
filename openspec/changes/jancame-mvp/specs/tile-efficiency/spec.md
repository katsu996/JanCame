# Delta for tile-efficiency

## ADDED Requirements

### Requirement: 向聴数計算

The system SHALL calculate the minimum shanten number for the recognized hand of up to 14 tiles, considering both standard form (4 melds + 1 pair) and seven pairs.

#### Scenario: 一般形の向聴

- **GIVEN** a valid array of 13 or 14 tile IDs
- **WHEN** shanten calculation is requested
- **THEN** the system returns the minimum shanten across standard and seven-pairs forms

#### Scenario: 無効入力

- **GIVEN** a tile array with more than 4 copies of any single tile
- **WHEN** shanten calculation is requested
- **THEN** the system returns an error or invalid state indicator

### Requirement: 打牌候補と受け入れ計算

The system SHALL compute discard candidates when 14 tiles are present, including shanten after discard, waiting tiles, and total ukeire count.

#### Scenario: 14枚時の打牌リスト

- **GIVEN** exactly 14 recognized tile IDs
- **WHEN** efficiency calculation runs
- **THEN** the system returns one DiscardCandidate per distinct discard option
- **AND** each candidate includes ukeireTiles and ukeireCount

#### Scenario: 受け入れ枚数の残り枚数

- **GIVEN** the default tile availability model (4 copies per tile, no river)
- **WHEN** ukeire count is calculated
- **THEN** the count reflects remaining copies minus tiles in the current hand

### Requirement: 打牌候補のソート

The system SHALL sort discard candidates by ukeire count descending, with shanten as tiebreaker.

#### Scenario: ソート順

- **GIVEN** multiple discard candidates with different ukeire counts
- **WHEN** results are returned
- **THEN** candidates are ordered by ukeireCount descending
- **AND** candidates with equal ukeireCount are ordered by shantenAfter ascending

### Requirement: 牌効率モジュールのテスト可能性

The system SHALL provide unit tests for shanten and ukeire calculation with at least 10 known hand fixtures.

#### Scenario: 回帰テスト

- **GIVEN** a fixture hand with a known shanten value
- **WHEN** the unit test runs
- **THEN** the calculated shanten matches the expected value
