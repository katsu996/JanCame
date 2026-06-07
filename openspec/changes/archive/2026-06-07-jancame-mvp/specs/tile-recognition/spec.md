# Delta for tile-recognition

## ADDED Requirements

### Requirement: 手牌領域の切り出し

The system SHALL detect or accept a hand-tile region and extract up to 14 individual tile images from the camera frame.

#### Scenario: 手動 ROI 指定

- **GIVEN** the user adjusts a rectangular region overlay on the video
- **WHEN** a frame is processed
- **THEN** the system applies perspective correction to the region
- **AND** splits the corrected region into individual tile slots left to right

#### Scenario: 牌数検出

- **GIVEN** 13 or 14 tiles are visible in the ROI
- **WHEN** contour detection completes
- **THEN** the system extracts the corresponding number of tile regions

### Requirement: 34種牌テンプレートマッチング

The system SHALL identify each extracted tile by matching against 34 pre-defined template images (1m–9m, 1p–9p, 1s–9s, E/S/W/N/P/F/C).

#### Scenario: 正常識別

- **GIVEN** a tile image with adequate lighting and frontal orientation
- **WHEN** template matching is performed
- **THEN** the system assigns a tile ID with a confidence score
- **AND** tiles are ordered left to right in the result array

#### Scenario: 低信頼度

- **GIVEN** a tile image where the best match confidence is below the configured threshold
- **WHEN** template matching completes
- **THEN** the tile is marked as unrecognized
- **AND** the tile is excluded from efficiency calculation

### Requirement: 認識結果の出力

The system SHALL produce a RecognitionResult containing tile IDs, confidence scores, and bounding boxes for UI overlay.

#### Scenario: 結果通知

- **GIVEN** frame processing completes successfully
- **WHEN** at least one tile is recognized
- **THEN** a RecognitionResult is emitted to the efficiency module and UI overlay
- **AND** each recognized tile includes its screen-space bounding box

### Requirement: 認識性能

The system SHOULD complete processing of one frame within 500 milliseconds on mid-range mobile devices.

#### Scenario: 処理時間上限

- **GIVEN** a standard 14-tile hand in the ROI
- **WHEN** the full recognition pipeline runs
- **THEN** processing completes within 500 ms on target devices
