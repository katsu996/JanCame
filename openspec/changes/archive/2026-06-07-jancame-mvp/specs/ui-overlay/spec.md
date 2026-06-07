# Delta for ui-overlay

## ADDED Requirements

### Requirement: カメラ映像オーバーレイ

The system SHALL render recognition labels and discard recommendations on top of the live camera feed using Canvas.

#### Scenario: 牌ラベル表示

- **GIVEN** tiles are recognized with bounding boxes
- **WHEN** the overlay renders
- **THEN** each tile displays its ID label (e.g. "1m", "5s") above its bounding box
- **AND** unrecognized tiles display "?" instead of an ID

#### Scenario: 切マーク表示

- **GIVEN** efficiency calculation returns a top discard candidate
- **WHEN** the overlay renders
- **THEN** a red "切" icon is displayed above the bounding box of the recommended discard tile

### Requirement: 牌効率パネル

The system SHALL display current shanten and a sorted list of discard options with ukeire details in a side or bottom panel.

#### Scenario: 状態表示

- **GIVEN** a valid efficiency result
- **WHEN** the panel renders
- **THEN** the current shanten is displayed (e.g. "1向聴")
- **AND** each discard option shows the tile, waiting tiles, and ukeire count

#### Scenario: 表示例

- **GIVEN** discard candidate: 9m with ukeire 3p, 6p, 1s totaling 12 tiles
- **WHEN** the panel renders the candidate
- **THEN** it displays equivalent information: tile to discard, waiting tiles, and total count

### Requirement: 手動補正

The system SHOULD allow the user to manually correct recognized tile IDs when recognition errors occur.

#### Scenario: 牌の修正

- **GIVEN** a tile is incorrectly recognized
- **WHEN** the user taps the tile label and selects the correct ID
- **THEN** the tile array is updated
- **AND** efficiency calculation re-runs with the corrected hand

### Requirement: レスポンシブレイアウト

The system SHALL support mobile portrait orientation as the primary layout.

#### Scenario: スマホ縦画面

- **GIVEN** the viewport is a mobile phone in portrait mode
- **WHEN** the app renders
- **THEN** the camera feed occupies the main area
- **AND** the efficiency panel is accessible without obscuring the entire video

### Requirement: 初回ロード UX

The system SHALL display a loading indicator while OpenCV.js and template assets are being loaded.

#### Scenario: 初回起動

- **GIVEN** the user opens the app for the first time
- **WHEN** OpenCV.js is loading
- **THEN** a loading indicator is shown
- **AND** the camera and recognition controls are disabled until loading completes
