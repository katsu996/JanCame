# Delta for ui-overlay

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: 初回ロード UX

The system SHALL display a loading indicator while OpenCV.js is loading. Camera and upload controls SHALL be disabled until OpenCV.js loading completes or times out.

#### Scenario: 初回起動

- **GIVEN** the user opens the app for the first time
- **WHEN** OpenCV.js is loading
- **THEN** a loading indicator is shown
- **AND** camera, upload, and recognition controls are disabled until loading completes
