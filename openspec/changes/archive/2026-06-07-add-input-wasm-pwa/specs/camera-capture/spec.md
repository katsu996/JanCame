# Delta for camera-capture

## ADDED Requirements

### Requirement: カメラストリーム ON/OFF

The system SHALL provide a control to start and stop the camera MediaStream independently of recognition processing.

#### Scenario: カメラ OFF

- **GIVEN** the camera stream is active
- **WHEN** the user turns the camera OFF
- **THEN** the MediaStream tracks are stopped
- **AND** the live preview is hidden or replaced with a placeholder

#### Scenario: カメラ ON

- **GIVEN** the camera is OFF and the input mode is camera
- **WHEN** the user turns the camera ON
- **THEN** the app requests camera access and resumes the live preview

### Requirement: 入力モード切り替え

The system SHALL support two input modes: `camera` and `image`, where only one is active at a time.

#### Scenario: 画像モードへ切り替え

- **GIVEN** the user uploads a test image
- **WHEN** image input mode is activated
- **THEN** the camera stream is stopped
- **AND** the uploaded image is used as the frame source for preview and recognition

#### Scenario: カメラモードへ復帰

- **GIVEN** image input mode is active
- **WHEN** the user switches back to camera mode
- **THEN** the uploaded image is cleared from the frame source
- **AND** the camera stream is started if camera is ON

## MODIFIED Requirements

### Requirement: フレーム間引きキャプチャ

The system SHALL capture frames at a throttled rate of 2 to 5 frames per second from the active frame source (camera stream or uploaded image).

#### Scenario: 通常キャプチャ

- **GIVEN** an active frame source and recognition is enabled
- **WHEN** the capture interval elapses
- **THEN** a frame is extracted as ImageData for the recognition pipeline

#### Scenario: タブ非表示時の停止

- **GIVEN** the browser tab is hidden
- **WHEN** the visibility state changes to hidden
- **THEN** frame capture and recognition processing SHALL stop
- **AND** processing SHALL resume when the tab becomes visible again

#### Scenario: カメラ OFF 時

- **GIVEN** the camera is OFF and input mode is camera
- **WHEN** a capture interval would elapse
- **THEN** no frames are captured

#### Scenario: 画像モードキャプチャ

- **GIVEN** image input mode is active with a loaded image
- **WHEN** the capture interval elapses
- **THEN** a frame is extracted from the uploaded image
