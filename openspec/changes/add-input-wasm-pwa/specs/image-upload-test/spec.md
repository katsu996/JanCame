# Delta for image-upload-test

## ADDED Requirements

### Requirement: テスト画像アップロード

The system SHALL allow the user to select a local image file (JPEG or PNG) to use instead of the camera feed.

#### Scenario: 画像選択成功

- **GIVEN** the user is on the main screen
- **WHEN** the user selects a valid JPEG or PNG file
- **THEN** the image is displayed in the preview area
- **AND** the input mode switches to image
- **AND** recognition uses the image as its frame source

#### Scenario: 非対応形式

- **GIVEN** the user selects an unsupported file type
- **WHEN** the file is rejected
- **THEN** an error message is displayed
- **AND** the previous input mode is preserved

### Requirement: 画像入力での認識

The system SHALL run the same recognition and efficiency pipeline on uploaded images as on camera frames.

#### Scenario: 静止画認識

- **GIVEN** an uploaded image containing a visible hand of tiles within the ROI
- **WHEN** recognition is enabled
- **THEN** tile labels and efficiency results are displayed on the image

#### Scenario: ROI 再調整

- **GIVEN** an uploaded image with different dimensions from the camera
- **WHEN** the image is loaded
- **THEN** the default ROI is scaled to the image dimensions
- **AND** the user can adjust the ROI handles as with camera mode

### Requirement: 画像入力のクリア

The system SHOULD allow the user to clear the uploaded image and return to camera input mode.

#### Scenario: 画像クリア

- **GIVEN** image input mode is active
- **WHEN** the user clears the uploaded image
- **THEN** input mode returns to camera
- **AND** the camera is started if camera is ON
