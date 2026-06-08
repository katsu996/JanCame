# Proposal: 牌認識の実機検証と改善

## Why

`improve-tile-recognition` の実装・自動テストは完了したが、**実機確認（7.1 / 7.2）が未実施**のままアーカイブされた。

同梱テンプレートは幾何デザインであり、実牌セット・照明・カメラ品質によって認識率は変わる。中級スマホでの処理時間・UI 応答性も、合成 fixture テストでは保証できない。本番リリース前に実機で受け入れ基準を満たすか検証し、不足があれば修正する必要がある。

## What Changes

1. **実機検証手順の整備** — カメラ / 画像モードでの確認チェックリスト、記録テンプレート
2. **計測 UI の追加** — フレーム処理時間・認識成功率を開発者が確認できる表示（軽量）
3. **実機検証の実施** — 実牌手牌で 10/14 以上認識、500 ms 以内・ROI 操作時のカクつきなしを確認
4. **検証結果に基づく改善** — テンプレート差し替え手順の検証、閾値調整、性能ボトルネック修正

## Capabilities

### New Capabilities

（なし）

### Modified Capabilities

- `tile-recognition`: 実機検証手順・受け入れ基準の明文化、計測表示
- `ui-overlay`: 検証時のパフォーマンス・信頼度の可視化補助

## Impact

- **新規**: `docs/verification/tile-recognition-device.md`（検証チェックリスト）
- **変更**: `src/main.ts`、`src/ui/` — 処理時間表示（開発用フラグまたは設定）
- **変更（必要時）**: `src/recognition/match.ts`（閾値）、`public/assets/tiles/`（実牌テンプレ）
- **README**: 実機検証手順へのリンク

## Non-Goals

- 全端末・全牌セットでの網羅的 QA マトリクス
- 自動 E2E（Playwright + 実機エミュレーション）
- 深層学習モデル導入
- App Store / Play Store 向けネイティブアプリ化
