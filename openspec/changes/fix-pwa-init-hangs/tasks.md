# Tasks: PWA 初期化ハング・カメラ応答・ローディング表示の不具合修正

## 1. 初期化パフォーマンス改善

- [x] 1.1 `loadTileTemplates` を並列化: 一意の ID のみ Promise.all で fetch、重複は Map で合成
- [x] 1.2 `recognitionWorker.init()` のタイムアウトを 20s → 5s に短縮
- [x] 1.3 `loadOpenCv` のタイムアウトを 20s → 10s に短縮
- [x] 1.4 Worker の `handleMessage` try-catch 確認（前回実施済み、tasks.md に反映）

## 2. カメラ制御改善

- [x] 2.1 `setRecognitionEnabled` で `frameCaptureRef.current` が null の場合 `setupFrameCapture()` を呼ぶ
- [x] 2.2 カメラ起動エラー時の表示確認と `retryCamera` アクションの動作確認
- [x] 2.3 OpenCV ロード中の進行状況メッセージを正確に表示

## 3. レイアウト修正

- [x] 3.1 LoadingOverlay を `aspect-video` コンテナの外に移動
- [x] 3.2 カメラエラー表示を `aspect-video` コンテナの外に移動
- [x] 3.3 「カメラ OFF」プレースホルダーをコンテナの外に移動
- [x] 3.4 ワイド画面 (1920x1080) で全てのオーバーレイが表示されることを確認

## 4. テスト・品質

- [x] 4.1 `pnpm exec tsc --noEmit` 通過確認
- [x] 4.2 `pnpm exec biome check .` 通過確認
- [x] 4.3 `pnpm test` 既存テスト通過確認
- [x] 4.4 `pnpm build` 通過確認
- [ ] 4.5 手動スモーク: 初期化完了、カメラ ON/OFF、画像アップロード
