# Delta for tile-recognition

## ADDED Requirements

### Requirement: 実機検証手順

The system SHALL provide a documented device verification procedure for real tile recognition acceptance.

#### Scenario: 検証手順の参照

- **GIVEN** a developer or QA tester prepares for device verification
- **WHEN** they follow the verification checklist
- **THEN** they can test camera mode, image upload mode, and record recognition counts against the 10/14 threshold

#### Scenario: カメラモード合格

- **GIVEN** a real 14-tile hand under recommended lighting
- **WHEN** recognition runs in camera mode with ROI adjusted
- **THEN** at least 10 tiles are correctly identified above the confidence threshold

#### Scenario: 画像モード合格

- **GIVEN** a photo of the same hand uploaded as JPEG or PNG
- **WHEN** recognition runs in image mode
- **THEN** at least 10 tiles are correctly identified above the confidence threshold

### Requirement: 認識性能計測表示

The system SHALL expose per-frame recognition timing for device verification when debug mode is enabled.

#### Scenario: デバッグ表示

- **GIVEN** debug mode is enabled (e.g. URL query parameter)
- **WHEN** a recognition frame completes
- **THEN** the UI shows the last frame processing time in milliseconds
- **AND** the recognized tile count is visible

## MODIFIED Requirements

### Requirement: 認識性能

The system SHOULD complete processing of one frame within 500 milliseconds on mid-range mobile devices, with recognition executed off the main thread when Workers are available. Device verification SHALL confirm this on target hardware.

#### Scenario: 処理時間上限

- **GIVEN** a standard 14-tile hand in the ROI on a mid-range mobile device
- **WHEN** the full recognition pipeline runs
- **THEN** processing completes within 500 ms on target devices

#### Scenario: UI 応答性

- **GIVEN** recognition is running continuously
- **WHEN** the user drags ROI handles
- **THEN** the UI remains responsive without multi-second freezes

#### Scenario: 実機性能確認

- **GIVEN** debug timing display is enabled during device verification
- **WHEN** recognition runs for multiple frames
- **THEN** the tester can confirm typical frame times meet the 500 ms target
