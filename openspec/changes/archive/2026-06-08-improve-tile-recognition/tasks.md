# Tasks: 牌認識の高精度化・高速化

## 1. テンプレートアセット

- [x] 1.1 `scripts/generate-tile-templates.mjs` — 34 種 PNG 生成（牌面風デザイン、48×64）
- [x] 1.2 `public/assets/tiles/*.png` — 生成物をコミット、`README.md` 更新
- [x] 1.3 `package.json` — `generate:templates` スクリプト追加
- [x] 1.4 `src/recognition/templates.ts` — PNG 優先ロード、アセット欠損時フォールバック

## 2. OpenCV マッチング

- [x] 2.1 `src/recognition/preprocess.ts` — スロット用 grayscale + equalizeHist
- [x] 2.2 `src/recognition/match.ts` — OpenCV `matchTemplate` (TM_CCOEFF_NORMED)、Mat キャッシュ
- [x] 2.3 `src/recognition/match.ts` — 閾値定数化、フォールバック相関の整理
- [x] 2.4 `src/recognition/pipeline.ts` — OpenCV マッチング配線、method メタデータ

## 3. 牌分割改善

- [x] 3.1 `src/recognition/split.ts` — 輪郭ベース分割（10〜14 個検出時）
- [x] 3.2 `src/recognition/split.ts` — 等幅フォールバック維持
- [x] 3.3 `src/recognition/pipeline.ts` — 分割方式の統合

## 4. Worker 分離

- [x] 4.1 `src/recognition/worker.ts` — 認識 Worker（OpenCV ロード + pipeline）
- [x] 4.2 `src/recognition/worker-client.ts` — 最新フレームのみ、タイムアウト処理
- [x] 4.3 `src/main.ts` — Worker クライアント配線、メインスレッドフォールバック
- [x] 4.4 `vite.config.ts` — Worker バンドル設定

## 5. UI / UX

- [x] 5.1 `src/ui/canvas.ts` — 信頼度表示、低信頼黄色枠
- [x] 5.2 `src/ui/correction.ts` — 34 種グリッドピッカー
- [x] 5.3 `src/main.ts` — 手動補正スロットの固定（自動上書き防止）

## 6. テスト・品質

- [x] 6.1 `tests/fixtures/hands/` — テスト用手牌画像 fixture（最低 1 手）
- [x] 6.2 `tests/recognition/match.test.ts` — テンプレートロード・スコア閾値
- [x] 6.3 `tests/recognition/pipeline.test.ts` — fixture 画像で 10/14 以上一致
- [x] 6.4 `pnpm lint` / `pnpm test` / `pnpm build` 通過確認
- [x] 6.5 README — テンプレート生成・差し替え手順追記

## 7. 実機確認

- [ ] 7.1 カメラ / 画像モードで実牌認識率確認
- [ ] 7.2 中級スマホで 500 ms 以内・UI カクつきなし確認
