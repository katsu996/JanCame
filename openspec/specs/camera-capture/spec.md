# Camera Capture Specification

## Purpose

Web カメラからライブ映像を取得し、認識パイプライン向けにフレームを間引きキャプチャする。

## Requirements

### Requirement: カメラストリーム取得

The system SHALL acquire a live video stream from the device camera using the Web MediaDevices API.

#### Scenario: 権限許可成功

- **GIVEN** the user is on an HTTPS or localhost origin
- **WHEN** the app requests camera access
- **THEN** a live video stream is displayed in the main area
- **AND** the rear camera is preferred when available

#### Scenario: 権限拒否

- **GIVEN** the user denies camera permission
- **WHEN** the app attempts to start the camera
- **THEN** an error message is displayed
- **AND** a retry action is available

### Requirement: フレーム間引きキャプチャ

The system SHALL capture video frames at a throttled rate of 2 to 5 frames per second to limit CPU and battery usage.

#### Scenario: 通常キャプチャ

- **GIVEN** the camera stream is active and recognition is enabled
- **WHEN** the capture interval elapses
- **THEN** a frame is extracted as ImageData for the recognition pipeline

#### Scenario: タブ非表示時の停止

- **GIVEN** the browser tab is hidden
- **WHEN** the visibility state changes to hidden
- **THEN** frame capture and recognition processing SHALL stop
- **AND** processing SHALL resume when the tab becomes visible again

### Requirement: 認識 ON/OFF トグル

The system SHOULD provide a toggle to enable or disable recognition processing for power saving.

#### Scenario: 認識 OFF

- **GIVEN** recognition is toggled off
- **WHEN** frames would normally be captured
- **THEN** no frames are sent to the recognition pipeline
- **AND** the live video preview continues to display
