# Delta for design-system

## ADDED Requirements

### Requirement: shadcn/ui デザインシステム

The system SHALL use shadcn/ui components as the primary UI building blocks for all interactive and layout elements.

#### Scenario: コンポーネント配置

- **GIVEN** the project is built for production
- **WHEN** UI components are rendered
- **THEN** interactive elements use shadcn/ui primitives from `src/components/ui/`
- **AND** styling follows the configured Tailwind theme tokens

#### Scenario: テーマ一貫性

- **GIVEN** any screen in the application
- **WHEN** the user views headers, panels, buttons, and dialogs
- **THEN** colors, spacing, and typography are consistent with the shadcn theme

### Requirement: Tailwind CSS スタイリング

The system SHALL use Tailwind CSS utility classes and CSS variables for layout and visual design instead of hand-written global UI CSS.

#### Scenario: レスポンシブレイアウト

- **GIVEN** a mobile portrait viewport
- **WHEN** the app renders
- **THEN** the camera viewport and side panel stack vertically using responsive Tailwind classes

#### Scenario: 旧 CSS の廃止

- **GIVEN** the migration is complete
- **WHEN** UI styling is applied
- **THEN** legacy `style.css` UI rules are removed or reduced to Canvas-specific styles only

### Requirement: React UI シェル

The system SHALL mount the application UI through a React root while preserving existing non-React core modules for recognition and efficiency.

#### Scenario: React マウント

- **GIVEN** the application loads
- **WHEN** the entry script runs
- **THEN** a React application is mounted to the DOM root
- **AND** camera, recognition, and efficiency modules remain importable TypeScript modules
