# Delta for pwa

## ADDED Requirements

### Requirement: Web App Manifest

The system SHALL provide a Web App Manifest with app name, icons, theme color, and start URL scoped to the GitHub Pages base path.

#### Scenario: Manifest 配信

- **GIVEN** the app is deployed to GitHub Pages at `/JanCame/`
- **WHEN** the browser requests the manifest
- **THEN** a valid manifest is returned with `start_url` and `scope` set to `/JanCame/`

#### Scenario: テーマカラー

- **GIVEN** the manifest is loaded
- **WHEN** the app is installed or added to home screen
- **THEN** the theme color matches the app header (`#1a1a2e`)

### Requirement: Service Worker

The system SHALL register a Service Worker that precaches static assets for offline app shell loading.

#### Scenario: 初回訪問

- **GIVEN** the user visits the app online
- **WHEN** the Service Worker installs
- **THEN** HTML, JS, CSS, and icons are cached

#### Scenario: オフライン起動

- **GIVEN** the app shell is cached
- **WHEN** the user opens the app offline
- **THEN** the app UI loads from cache
- **AND** a message indicates that camera and online features require network

### Requirement: インストール可能

The system SHOULD support browser install prompts (Add to Home Screen / Install app).

#### Scenario: インストール

- **GIVEN** the browser supports PWA installation
- **WHEN** install criteria are met
- **THEN** the user can install JanCame as a standalone app

### Requirement: PWA アイコン

The system SHALL include at least 192x192 and 512x512 PNG icons referenced from the manifest.

#### Scenario: アイコン表示

- **GIVEN** the app is installed
- **WHEN** the home screen icon is displayed
- **THEN** the JanCame icon is shown at the correct size
