# UI Overlay Specification

## Purpose

カメラ映像上のオーバーレイと牌効率パネルにより、認識結果と打牌推奨をユーザーに表示する。

## Requirements

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

### Requirement: 検証用デバッグ表示

The system SHALL show optional debug metrics on the overlay or panel to support device verification.

#### Scenario: 処理時間の表示

- **GIVEN** debug mode is enabled
- **WHEN** recognition completes a frame
- **THEN** the last frame processing time is displayed in the UI

#### Scenario: 認識枚数の表示

- **GIVEN** debug mode is enabled
- **WHEN** recognition results are rendered
- **THEN** the count of recognized tiles versus total slots is displayed

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

The system SHOULD allow the user to manually correct recognized tile IDs when recognition errors occur, with a one-tap tile picker per slot.

#### Scenario: 牌の修正

- **GIVEN** a tile is incorrectly recognized
- **WHEN** the user selects the correct ID from the correction UI
- **THEN** the tile array is updated
- **AND** efficiency calculation re-runs with the corrected hand

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

### Requirement: レスポンシブレイアウト

The system SHALL support mobile portrait orientation as the primary layout.

#### Scenario: スマホ縦画面

- **GIVEN** the viewport is a mobile phone in portrait mode
- **WHEN** the app renders
- **THEN** the camera feed occupies the main area
- **AND** the efficiency panel is accessible without obscuring the entire video

### Requirement: カメラ ON/OFF ボタン

The system SHALL display a camera ON/OFF button in the header that controls the MediaStream independently of the recognition toggle.

#### Scenario: ボタン表示

- **GIVEN** the app is loaded
- **WHEN** the header renders
- **THEN** a camera ON/OFF control is visible alongside the recognition toggle

#### Scenario: OFF 状態の表示

- **GIVEN** the camera is OFF
- **WHEN** the header renders
- **THEN** the camera button indicates OFF state
- **AND** the preview area shows a placeholder message

### Requirement: 画像アップロード UI

The system SHALL provide a file input or button to upload a test image in the header or panel area.

#### Scenario: アップロードボタン

- **GIVEN** the app is loaded
- **WHEN** the user clicks the upload control
- **THEN** a file picker opens accepting JPEG and PNG

#### Scenario: 入力モード表示

- **GIVEN** image input mode is active
- **WHEN** the header or panel renders
- **THEN** the current input mode and file name are displayed

### Requirement: 初回ロード UX

The system SHALL display a loading indicator while OpenCV.js is loading. Camera and upload controls SHALL be disabled until OpenCV.js loading completes or times out.

#### Scenario: 初回起動

- **GIVEN** the user opens the app for the first time
- **WHEN** OpenCV.js is loading
- **THEN** a loading indicator is shown
- **AND** camera, upload, and recognition controls are disabled until loading completes
