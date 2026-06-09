# Proposal: shadcn/ui による UI 刷新

## Why

現状の UI は素の HTML + `style.css` + DOM 操作（`src/ui/*.ts`）で構成されており、以下の課題がある。

- コンポーネントの再利用性・一貫性が低い（ボタン、トグル、パネルが個別実装）
- デザイン変更のコストが高い（CSS 全体の手書きメンテナンス）
- アクセシビリティ（フォーカス、ARIA、キーボード操作）が十分でない
- 今後の UI 拡張（設定画面、ヘルプ、テーマ切替）に向けた基盤がない

[shadcn/ui](https://ui.shadcn.com/) は Tailwind CSS + Radix UI ベースのコピー＆ペースト型コンポーネント群であり、デザインシステムを素早く導入できる。JanCame の Web デザインを全体的に刷新し、統一感のあるモダン UI に移行する。

## What Changes

1. **React 導入** — shadcn/ui の前提となる React を Vite プロジェクトに追加（UI 層のみ。認識・牌効率・カメラのコアロジックは既存 TS モジュールを維持）
2. **Tailwind CSS + shadcn/ui セットアップ** — `components.json`、テーマ変数、パスエイリアス `@/`
3. **レイアウト刷新** — ヘッダー、サイドパネル、カメラビューポートを shadcn コンポーネントで再構成
4. **既存 UI の置き換え** — トグル、ボタン、カード、ダイアログ、アラート等を shadcn コンポーネントに移行
5. **旧 CSS の段階的廃止** — `style.css` の UI 関連スタイルを Tailwind + shadcn テーマに統合（Canvas オーバーレイ用の最小 CSS は残す）

## Capabilities

### New Capabilities

- `design-system`: shadcn/ui ベースのデザインシステム・テーマ・コンポーネント規約

### Modified Capabilities

- `ui-overlay`: パネル・ヘッダー・補正 UI のコンポーネント化とビジュアル刷新

## Impact

- **依存追加**: `react`, `react-dom`, `tailwindcss`, `@vitejs/plugin-react`, shadcn 関連（`class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*`, `lucide-react` 等）
- **新規**: `src/components/ui/*`（shadcn プリミティブ）、`src/components/app/*`（アプリ固有 UI）
- **変更**: `index.html`, `src/main.ts` → `src/main.tsx`, `vite.config.ts`, `tsconfig.json`
- **削除予定**: `src/ui/controls.ts`, `src/ui/panel.ts`, `src/ui/correction.ts` の DOM 直書き（ロジックは React へ移行）
- **維持**: `src/ui/canvas.ts`, `src/ui/roi-editor.ts`（Canvas / ROI は React から ref でラップ）
- **CI**: ビルド・lint・テストの更新

## Non-Goals

- 認識パイプライン・牌効率 WASM・OpenCV Worker の React 化
- Canvas 2D オーバーレイの React Canvas ライブラリへの置き換え
- ライトモード / ダークモード切替 UI（初期はダークテーマ固定）
- Storybook 導入
- Next.js への移行
- 多言語化（i18n）
