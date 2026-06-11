# Proposal: PWA 初期化ハング・カメラ応答・ローディング表示の不具合修正

## Why

`fix-initial-render-bugs` 適用後も以下の 3 つの不具合が残っている:

1. **OpenCV.js 読み込み完了しない**: 「OpenCV.js を初期化中...」が長時間表示され、ローディングが完了しない。実際には OpenCV.js CDN URL が 404 だったが修正済み。さらに Worker 内のテンプレート読み込みが `document` 非対応でクラッシュし、Worker 初期化のタイムアウト待ち (20s) が発生。全体の初期化に 40 秒以上かかる。
2. **カメラ ON/OFF トグルが反応しない**: `controlsEnabled` が `false` のままの場合や、カメラ起動エラーが適切に通知されず、ユーザーが何をすればいいか分からない。エラー状態からの復帰フローも不十分。
3. **ローディング文言が画面幅を狭めないと見えない**: `CameraViewport` の `aspect-video` コンテナに `overflow-hidden` + `max-h-[70vh]` が設定されており、ワイド画面ではローディングオーバーレイが画面外に見切れる場合がある。

## What Changes

1. **初期化パフォーマンス改善と完了保証**: Worker のテンプレート読み込み失敗を早期検出し、即座にメインスレッドフォールバック。OpenCV.js の CDN URL 修正。`loadTileTemplates` の逐次 fetch を最適化（Promise.all で並列化）。
2. **カメラ制御の応答性改善**: カメラ開始失敗時のエラー表示とリトライ UX を改善。`setRecognitionEnabled` アクション内で `frameCaptureRef.current?.start()` が呼ばれないケースを修正。
3. **LoadingOverlay とエラー表示のレイアウト修正**: `aspect-video` の外に LoadingOverlay を移動し、常に画面中央に表示。カメラエラーの表示位置も同様に改善。

## Capabilities

### Modified Capabilities

- `ui-overlay`: LoadingOverlay の表示位置と条件を修正
- `init-app`: 初期化フローのパフォーマンス改善と完了保証
- `camera-control`: カメラ ON/OFF のエラーハンドリング改善

## Impact

- **修正**: `src/recognition/templates.ts`（loadTileTemplates 並列化）
- **修正**: `src/recognition/opencv-loader.ts`、`src/recognition/opencv-worker-loader.ts`（CDN URL）
- **修正**: `src/recognition/worker-client.ts`（タイムアウト短縮・早期フォールバック）
- **修正**: `src/recognition/recognition.worker.ts`（try-catch）
- **修正**: `src/hooks/useJanCame.ts`（カメラ制御・認識制御アクション）
- **修正**: `src/components/app/CameraViewport.tsx`（LoadingOverlay 表示位置）
- **影響範囲**: 最小限。認識パイプライン・牌効率 WASM は不変。

## Non-Goals

- 認識パイプライン自体の改良
- 牌効率ロジックの変更
- UI テーマの変更
- 新しい認識手法の導入
