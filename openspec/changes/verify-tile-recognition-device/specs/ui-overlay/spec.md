# Delta for ui-overlay

## ADDED Requirements

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
