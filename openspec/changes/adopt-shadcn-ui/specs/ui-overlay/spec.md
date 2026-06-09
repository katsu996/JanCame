# Delta for ui-overlay

## MODIFIED Requirements

### Requirement: カメラ映像オーバーレイ

The system SHALL render recognition labels and discard recommendations on top of the live camera feed using Canvas, within a shadcn-styled viewport container.

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

The system SHALL display current shanten and a sorted list of discard options with ukeire details in a shadcn Card-based side or bottom panel.

#### Scenario: 状態表示

- **GIVEN** a valid efficiency result
- **WHEN** the panel renders
- **THEN** the current shanten is displayed (e.g. "1向聴")
- **AND** each discard option shows the tile, waiting tiles, and ukeire count

#### Scenario: 表示例

- **GIVEN** discard candidate: 9m with ukeire 3p, 6p, 1s totaling 12 tiles
- **WHEN** the panel renders the candidate
- **THEN** it displays equivalent information: tile to discard, waiting tiles, and total count

### Requirement: 手動補正 UX 改善

The system SHALL provide a quick tile picker for correcting unrecognized or wrong slots using shadcn Button and Sheet or Dialog components.

#### Scenario: スロットタップ補正

- **GIVEN** a slot shows "?" or an incorrect tile
- **WHEN** the user taps the slot in the correction panel
- **THEN** a grid of 34 tile options is shown in a shadcn overlay
- **AND** selecting a tile updates the hand and re-runs efficiency calculation

#### Scenario: 補正後の安定表示

- **GIVEN** the user manually corrected one or more tiles
- **WHEN** the next frame recognition differs on corrected slots
- **THEN** manually corrected values are preserved until the user clears them

### Requirement: カメラ ON/OFF ボタン

The system SHALL display camera and recognition toggles in the header using shadcn Switch and Button components.

#### Scenario: ボタン表示

- **GIVEN** the app is loaded
- **WHEN** the header renders
- **THEN** camera and recognition controls are visible with consistent shadcn styling

#### Scenario: OFF 状態の表示

- **GIVEN** the camera is OFF
- **WHEN** the header renders
- **THEN** the camera toggle indicates OFF state
- **AND** the preview area shows a placeholder message in a shadcn Alert or muted container

### Requirement: 画像アップロード UI

The system SHALL provide image upload and clear actions using shadcn Button components in the header.

#### Scenario: アップロードボタン

- **GIVEN** the app is loaded
- **WHEN** the user clicks the upload control
- **THEN** a file picker opens accepting JPEG and PNG

#### Scenario: 入力モード表示

- **GIVEN** image input mode is active
- **WHEN** the header renders
- **THEN** the current input mode and file name are displayed in a shadcn Badge

### Requirement: 初回ロード UX

The system SHALL display a loading indicator using shadcn-styled components while OpenCV.js is loading. Camera and upload controls SHALL be disabled until loading completes or times out.

#### Scenario: 初回起動

- **GIVEN** the user opens the app for the first time
- **WHEN** OpenCV.js is loading
- **THEN** a loading indicator is shown over the viewport
- **AND** camera, upload, and recognition controls are disabled until loading completes

### Requirement: 検証用デバッグ表示

The system SHALL show optional debug metrics in a shadcn Card when debug mode is enabled.

#### Scenario: 処理時間の表示

- **GIVEN** debug mode is enabled
- **WHEN** recognition completes a frame
- **THEN** the last frame processing time is displayed in the UI

#### Scenario: 認識枚数の表示

- **GIVEN** debug mode is enabled
- **WHEN** recognition results are rendered
- **THEN** the count of recognized tiles versus total slots is displayed

### Requirement: レスポンシブレイアウト

The system SHALL support mobile portrait orientation as the primary layout using Tailwind responsive utilities.

#### Scenario: スマホ縦画面

- **GIVEN** the viewport is a mobile phone in portrait mode
- **WHEN** the app renders
- **THEN** the camera feed occupies the main area
- **AND** the efficiency panel is accessible below the viewport without obscuring the entire video
