# Proposal: 牌認識の高精度化・高速化

## Why

MVP では合成 Unicode テンプレートと簡易相関マッチのため、実牌カメラ入力ではほぼすべて `?` となり牌効率まで到達できない。牌効率 WASM・画像入力・PWA は整ったが、**認識がボトルネック**になっている。

ユーザーは物理手牌を向けるだけで向聴・打牌候補を得たい。精度・レスポンス・補正 UX を同時に改善し、手動補正だけに頼らない体験にする必要がある。

## What Changes

1. **実牌相当テンプレート画像** — `public/assets/tiles/` に 34 種 PNG を同梱し、実行時生成テンプレートをフォールバックに格下げ
2. **OpenCV.js 本格マッチング** — `matchTemplate` + 前処理（グレースケール・正規化）で識別精度を向上
3. **牌分割の改善** — 等幅分割に加え、輪郭ベースの個別切り出しを優先
4. **認識 Worker 分離** — メインスレッドの UI カクつきを抑え、実効 FPS を維持
5. **認識 UX 強化** — 信頼度表示、低信頼スロットの強調、ワンタップ補正、安定時の自動更新抑制

## Capabilities

### New Capabilities

（なし — 既存 `tile-recognition` を拡張）

### Modified Capabilities

- `tile-recognition`: 実牌テンプレート、OpenCV マッチング、分割改善、Worker、性能目標の更新
- `ui-overlay`: 信頼度表示、低信頼ハイライト、補正 UX 改善

## Impact

- **新規アセット**: `public/assets/tiles/*.png`（34 枚）、テンプレート生成スクリプト `scripts/generate-tile-templates.mjs`
- **変更**: `src/recognition/*`、`src/ui/canvas.ts`、`src/ui/correction.ts`、`src/main.ts`
- **新規**: `src/recognition/worker.ts`（または `recognition.worker.ts`）
- **テスト**: `tests/recognition/` — フィクスチャ画像 + 期待牌 ID
- **CI**: 認識テスト追加（Node + happy-dom / 画像 fixture）

## Non-Goals

- YOLO / TensorFlow.js 等の深層学習モデル導入
- 他家の河・捨て牌・ドラ牌の認識
- 牌の向き（逆さ・横向き）への完全対応（正面〜軽度傾きのみ）
- テンプレートのユーザー毎クラウド同期
- 認識パイプラインの WASM 化（Worker + OpenCV.js で十分とする）
