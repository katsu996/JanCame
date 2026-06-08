# Delta for ui-overlay

## ADDED Requirements

### Requirement: 認識信頼度表示

The system SHALL display a confidence indicator for each recognized tile on the overlay.

#### Scenario: 高信頼度

- **GIVEN** a tile is recognized with confidence above the threshold
- **WHEN** the overlay renders
- **THEN** the tile label includes a percentage or visual confidence indicator

#### Scenario: 低信頼度強調

- **GIVEN** a tile slot is unrecognized or below threshold
- **WHEN** the overlay renders
- **THEN** the slot uses a distinct highlight color (e.g. yellow border)
- **AND** the label shows "?"

### Requirement: 手動補正 UX 改善

The system SHALL provide a quick tile picker for correcting unrecognized or wrong slots.

#### Scenario: スロットタップ補正

- **GIVEN** a slot shows "?" or an incorrect tile
- **WHEN** the user taps the slot in the correction panel
- **THEN** a grid of 34 tile options is shown
- **AND** selecting a tile updates the hand and re-runs efficiency calculation

#### Scenario: 補正後の安定表示

- **GIVEN** the user manually corrected one or more tiles
- **WHEN** the next frame recognition differs on corrected slots
- **THEN** manually corrected values are preserved until the user clears them

## MODIFIED Requirements

### Requirement: 手動補正

The system SHOULD allow the user to manually correct recognized tile IDs when recognition errors occur, with a one-tap tile picker per slot.

#### Scenario: 牌の修正

- **GIVEN** a tile is incorrectly recognized
- **WHEN** the user selects the correct ID from the correction UI
- **THEN** the tile array is updated
- **AND** efficiency calculation re-runs with the corrected hand
