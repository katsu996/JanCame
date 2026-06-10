# Proposal: 初期表示・カメラ・画像表示の不具合修正

## Why

shadcn/ui 移行後に以下の3つの不具合が確認されている:

1. **画面が真っ黒**: 1920x1080 で表示すると真っ黒な画面になり、ロード中なのか完了したのか判断できない。ブラウザ幅を狭めるとロード画面は表示される。
2. **カメラが起動しない**: カメラ ON/OFF トグルを操作してもカメラストリームが開始されない。
3. **画像が表示されない**: 画像を選択してもプレビューに表示されず、認識も動作しない。

これらは React + shadcn/ui 移行時の DOM 構成変更により、以下の箇所で問題が生じている可能性が高い:
- `useEffect` の初期化タイミングと video/canvas ref の結合
- FrameCapture / OverlayRenderer のソース解決
- 初期ローディング状態の終了条件

## What Changes

1. **初期化フローの堅牢化**: `useJanCame` の `useEffect` 初期化で、ref が null の場合のガードと `loadTileTemplates()` 等のエラーハンドリングを追加。ロード完了後の viewport 状態を正しく表示する。
2. **カメラ起動フローの修正**: `InputManager` / `CameraFrameSource` への video 要素の受け渡しタイミングを修正し、カメラ起動失敗時のエラー表示を改善。
3. **画像表示パイプラインの修正**: 画像選択後の FrameCapture / previewCanvas / overlayCanvas の更新フローを修正し、画像が正しく表示・認識されるようにする。

## Capabilities

### Modified Capabilities

- `ui-overlay`: 初期表示・ローディング・エラー表示の条件ロジック修正
- `camera-capture`: カメラ初期化フローの堅牢化
- `image-upload-test`: 画像選択後の表示・認識フロー修正

## Impact

- **変更**: `src/hooks/useJanCame.ts`（初期化フロー）
- **変更**: `src/components/app/CameraViewport.tsx`（表示条件）
- **変更**: `src/components/app/App.tsx`（初期化ガード）
- **影響範囲**: 最小限。コアモジュール（認識・牌効率・WASM）は不変。

## Non-Goals

- 認識パイプライン自体の改良
- 牌効率ロジックの変更
- 新機能の追加
- Canvas/ROI 以外の UI 再設計
