# Tasks: 初期表示・カメラ・画像表示の不具合修正

## 1. 初期化フロー堅牢化

- [x] 1.1 `initApp` 全体を try-catch でラップ、異常時も `loading: false` に遷移
- [x] 1.2 初期化エラーメッセージを `cameraError` に設定し viewport に表示
- [x] 1.3 LoadingOverlay の CSS 表示条件を確認（aspect-video が narrow 時にどう振る舞うか）

## 2. useEffect 依存配列整理

- [x] 2.1 `setupFrameCapture` の依存配列を `[]` に変更、内部で `stateRef` を使用
- [x] 2.2 `recognitionEnabled` 変更時の start/stop を actions 側で直接制御
- [x] 2.3 init useEffect の依存を不要な再実行がないよう整理

## 3. 画像選択後表示フロー修正

- [x] 3.1 `handleImageSelected` で `frameCaptureRef.current.start()` を即時呼び出し
- [x] 3.2 画像モード切替後の previewCanvas 描画を確認・修正
- [x] 3.3 画像クリア後のカメラ復帰フローを確認・修正

## 4. テスト・品質

- [x] 4.1 `pnpm lint` / `pnpm exec tsc --noEmit` 通過確認
- [x] 4.2 `pnpm test` 既存テスト通過確認
- [x] 4.3 `pnpm build` 通過確認
- [ ] 4.4 手動スモーク: 画面表示、カメラ ON/OFF、画像アップロード
