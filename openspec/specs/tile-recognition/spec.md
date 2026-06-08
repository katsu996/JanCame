# Tile Recognition Specification

## Purpose

OpenCV.js とテンプレートマッチングにより、カメラ映像から最大14枚の牌を識別する。

## Requirements

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

### Requirement: 実牌テンプレートアセット

The system SHALL load 34 tile template images from static assets under `public/assets/tiles/` before falling back to runtime-generated templates.

#### Scenario: アセット読み込み成功

- **GIVEN** all 34 PNG template files exist in the assets directory
- **WHEN** the app initializes templates
- **THEN** each template is loaded from the PNG asset
- **AND** the template source is marked as asset-based

#### Scenario: アセット欠損時フォールバック

- **GIVEN** one or more PNG template files are missing
- **WHEN** template loading runs
- **THEN** missing templates are generated at runtime
- **AND** a console warning indicates fallback mode

### Requirement: テンプレート生成スクリプト

The system SHALL provide a script to regenerate the 34 template PNG files for development and customization.

#### Scenario: テンプレート再生成

- **GIVEN** the developer runs the template generation command
- **WHEN** the script completes
- **THEN** 34 PNG files are written to the assets directory
- **AND** file names match the TileId convention

### Requirement: 34種牌テンプレートマッチング

The system SHALL identify each extracted tile by matching against 34 template images (1m–9m, 1p–9p, 1s–9s, E/S/W/N/P/F/C), preferring static PNG assets and OpenCV matching.

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

### Requirement: OpenCV テンプレートマッチング

The system SHALL identify tiles using OpenCV.js template matching with normalized correlation scoring.

#### Scenario: 正常識別

- **GIVEN** a tile slot image and loaded PNG templates
- **WHEN** OpenCV template matching runs
- **THEN** the best matching tile ID is assigned with a confidence score between 0 and 1

#### Scenario: 前処理

- **GIVEN** varying lighting in the camera frame
- **WHEN** matching begins
- **THEN** grayscale conversion and histogram normalization are applied to the slot image

### Requirement: 輪郭ベース牌分割

The system SHALL prefer contour-based tile segmentation over equal-width splitting when 10 to 14 valid tile contours are detected.

#### Scenario: 輪郭分割成功

- **GIVEN** 13 or 14 tile-like contours in the ROI
- **WHEN** segmentation runs
- **THEN** individual tile images are cropped from contour bounding boxes
- **AND** tiles are ordered left to right

#### Scenario: 等幅フォールバック

- **GIVEN** fewer than 10 valid contours are detected
- **WHEN** segmentation runs
- **THEN** the ROI is split into equal-width slots as a fallback

### Requirement: 認識 Worker

The system SHALL run the recognition pipeline in a Web Worker to avoid blocking the main UI thread.

#### Scenario: Worker 処理

- **GIVEN** OpenCV.js is loaded in the worker
- **WHEN** a new frame is submitted
- **THEN** recognition runs off the main thread
- **AND** only the latest frame result is applied if multiple frames are pending

#### Scenario: Worker 非対応

- **GIVEN** Web Workers are unavailable
- **WHEN** recognition is requested
- **THEN** the pipeline runs on the main thread without crashing

### Requirement: 認識結果の出力

The system SHALL produce a RecognitionResult containing tile IDs, confidence scores, and bounding boxes for UI overlay.

#### Scenario: 結果通知

- **GIVEN** frame processing completes successfully
- **WHEN** at least one tile is recognized
- **THEN** a RecognitionResult is emitted to the efficiency module and UI overlay
- **AND** each recognized tile includes its screen-space bounding box

### Requirement: 認識回帰テスト

The system SHALL include automated tests with fixture images that verify at least one full hand recognition case.

#### Scenario: フィクスチャ一致

- **GIVEN** a fixture image with known tile layout
- **WHEN** the recognition pipeline runs in tests
- **THEN** at least 10 of 14 slots match expected tile IDs above the confidence threshold

### Requirement: 認識性能

The system SHOULD complete processing of one frame within 500 milliseconds on mid-range mobile devices, with recognition executed off the main thread when Workers are available.

#### Scenario: 処理時間上限

- **GIVEN** a standard 14-tile hand in the ROI
- **WHEN** the full recognition pipeline runs
- **THEN** processing completes within 500 ms on target devices

#### Scenario: UI 応答性

- **GIVEN** recognition is running continuously
- **WHEN** the user drags ROI handles
- **THEN** the UI remains responsive without multi-second freezes
