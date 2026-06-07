# Tasks: JanCame MVP

## 1. プロジェクト基盤

- [ ] 1.1 Vite + TypeScript プロジェクトを初期化し、`src/types/` に共有型（TileId, RecognizedTile, EfficiencyResult 等）を定義する
- [ ] 1.2 ESLint / Vitest を設定し、`npm run dev` / `npm run test` が動作することを確認する
- [ ] 1.3 静的デプロイ用のビルド設定（GitHub Pages 等）を追加する

## 2. 牌効率モジュール（tile-efficiency）

- [ ] 2.1 `src/efficiency/shanten.ts` — 一般形・七対子の向聴数計算を実装する
- [ ] 2.2 `src/efficiency/ukeire.ts` — 14枚時の打牌候補・受け入れ牌・受け入れ枚数を実装する
- [ ] 2.3 `src/efficiency/index.ts` — 入力検証（4枚上限）と候補ソートの公開 API を提供する
- [ ] 2.4 `tests/efficiency/` — 既知手牌10件以上のユニットテストを追加する

## 3. カメラキャプチャ（camera-capture）

- [ ] 3.1 `src/camera/stream.ts` — getUserMedia でカメラ取得、`<video>` 要素へのストリーム接続
- [ ] 3.2 `src/camera/capture.ts` — 2〜5 FPS のフレーム間引き、ImageData 抽出
- [ ] 3.3 権限拒否時のエラー UI、タブ非表示時の処理停止、認識 ON/OFF トグル

## 4. テンプレートアセット

- [ ] 4.1 `public/assets/tiles/` — 34種牌テンプレート PNG を用意する（統一解像度・背景）
- [ ] 4.2 テンプレート読み込みユーティリティ（`src/recognition/templates.ts`）を実装する

## 5. 画像認識モジュール（tile-recognition）

- [ ] 5.1 OpenCV.js の遅延ロードとローディング UI
- [ ] 5.2 `src/recognition/preprocess.ts` — グレースケール化、Canny エッジ、輪郭検出
- [ ] 5.3 `src/recognition/roi.ts` — 手動 ROI 枠 UI、パース補正（getPerspectiveTransform）
- [ ] 5.4 `src/recognition/split.ts` — 手牌領域の等幅分割（最大14枚）
- [ ] 5.5 `src/recognition/match.ts` — テンプレートマッチング、信頼度閾値、34種識別
- [ ] 5.6 `src/recognition/pipeline.ts` — 前処理 → 分割 → マッチングの統合パイプライン

## 6. UI オーバーレイ（ui-overlay）

- [ ] 6.1 `src/ui/canvas.ts` — カメラ映像 + Canvas オーバーレイ描画（牌ラベル・切マーク）
- [ ] 6.2 `src/ui/panel.ts` — 向聴数・打牌候補リストの DOM パネル
- [ ] 6.3 `src/ui/roi-editor.ts` — 手動 ROI 枠のドラッグ調整 UI
- [ ] 6.4 `src/ui/correction.ts` — 認識結果の手動修正 UI
- [ ] 6.5 `src/main.ts` — 全モジュールの配線（カメラ → 認識 → 牌効率 → UI）
- [ ] 6.6 モバイル縦画面レスポンシブレイアウト

## 7. 統合・品質

- [ ] 7.1 認識パイプラインと牌効率モジュールの end-to-end 接続
- [ ] 7.2 実機カメラでの動作確認（13〜14枚手牌）
- [ ] 7.3 認識精度・処理時間の計測と閾値調整
- [ ] 7.4 README にセットアップ手順・使い方・制限事項を記載

## 8. 将来（Phase 2 — MVP 外）

- [ ] 8.1 Rust + wasm-pack による牌効率 WASM 化
- [ ] 8.2 Web Worker による認識処理のメインスレッド分離
- [ ] 8.3 ORB 特徴点マッチングへの切り替え検討
