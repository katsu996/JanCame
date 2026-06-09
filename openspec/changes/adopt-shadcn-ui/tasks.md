# Tasks: shadcn/ui による UI 刷新

## 1. 基盤セットアップ

- [ ] 1.1 `react`, `react-dom`, `@vitejs/plugin-react` 追加、`vite.config.ts` / `tsconfig.json` 更新
- [ ] 1.2 Tailwind CSS v4 + PostCSS 設定、`src/index.css`（shadcn CSS 変数）作成
- [ ] 1.3 `pnpm dlx shadcn@latest init` — `components.json`、パスエイリアス `@/`、`src/lib/utils.ts`
- [ ] 1.4 Biome JSX 設定確認、`index.html` を React マウント用に更新

## 2. shadcn コンポーネント追加

- [ ] 2.1 基本: `button`, `switch`, `label`, `badge`, `card`, `separator`, `alert`
- [ ] 2.2 オーバーレイ: `sheet`, `dialog`, `scroll-area`, `skeleton`
- [ ] 2.3 アイコン: `lucide-react` 導入

## 3. React アプリ骨格

- [ ] 3.1 `src/main.tsx` + `src/components/app/App.tsx` — ルートレイアウト
- [ ] 3.2 `src/hooks/useJanCame.ts` — 既存コアモジュールの状態ブリッジ
- [ ] 3.3 `src/components/app/CameraViewport.tsx` — video/canvas/ROI ref ラッパー

## 4. UI コンポーネント移行

- [ ] 4.1 `AppHeader.tsx` — カメラ/認識 Switch、画像アップロード、Badge（`controls.ts` 置換）
- [ ] 4.2 `EfficiencyPanel.tsx` — Card + 候補リスト（`panel.ts` 置換）
- [ ] 4.3 `CorrectionPanel.tsx` — Sheet/Dialog + 牌グリッド（`correction.ts` 置換）
- [ ] 4.4 `LoadingOverlay.tsx` / `CameraErrorAlert.tsx` / `OfflineAlert.tsx`
- [ ] 4.5 `DebugMetricsCard.tsx`（`debug-metrics.ts` 置換）

## 5. スタイル統合・クリーンアップ

- [ ] 5.1 `style.css` の UI スタイルを Tailwind に移行、Canvas/ROI 用のみ残す
- [ ] 5.2 ダークテーマ・アクセントカラー調整、PWA `theme-color` 更新
- [ ] 5.3 旧 `src/ui/controls.ts`, `panel.ts`, `correction.ts`, `debug-metrics.ts` 削除
- [ ] 5.4 `src/main.ts` を `main.tsx` に完全移行

## 6. テスト・品質

- [ ] 6.1 既存 Vitest の通過確認（コアモジュール）
- [ ] 6.2 手動スモーク: カメラ ON/OFF、画像アップロード、認識、補正、牌効率
- [ ] 6.3 `pnpm lint` / `pnpm test` / `pnpm build` 通過
- [ ] 6.4 README — 技術スタック（React + shadcn/ui）追記
