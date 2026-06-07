# Proposal: 入力強化・WASM・PWA

## Why

MVP ではカメラ映像のみを入力とし、牌効率は TypeScript で計算している。以下の課題がある。

- カメラを止めたい場面（省電力・プライバシー）で、認識 OFF だけではストリームが生きたままになる
- 実機カメラなしで認識パイプラインを検証する手段がない（開発・回帰テストが困難）
- 牌効率計算の将来拡張（残り枚数テーブル等）に備え、高速な WASM エンジンが欲しい
- ホーム画面追加・オフライン起動など、隙間時間利用に PWA が適している

## What Changes

1. **カメラ ON/OFF ボタン** — ストリーム自体の開始・停止（既存の「認識 ON/OFF」とは独立）
2. **テスト用画像アップロード** — 画像ファイルを選択するとカメラの代わりに表示・認識に使用
3. **牌効率 WASM 化** — Rust + wasm-pack で向聴・受け入れ計算を移植し、TS から呼び出し
4. **PWA 化** — Web App Manifest、Service Worker、インストール可能 UI

## Capabilities

### New Capabilities

- `image-upload-test`: テスト用静止画アップロードとカメラ代替入力モード
- `pwa`: Manifest、Service Worker、オフラインキャッシュ、インストール対応

### Modified Capabilities

- `camera-capture`: カメラストリーム ON/OFF、画像入力モードとの切り替え
- `tile-efficiency`: WASM バックエンド追加、TS フォールバック維持
- `ui-overlay`: カメラ ON/OFF ボタン、画像アップロード UI、入力モード表示

## Impact

- **新規**: `crates/tile-efficiency/`（Rust）、`public/manifest.webmanifest`、Service Worker（Vite PWA プラグイン等）
- **変更**: `src/camera/`、`src/main.ts`、`src/ui/`、`index.html`
- **CI**: Rust/wasm-pack ビルドステップ追加（GitHub Actions）
- **非ゴール**: 複数画像の連続再生、動画ファイル入力、バックグラウンド認識、プッシュ通知

## Non-Goals

- 動画ファイル（MP4 等）のアップロード入力
- オフライン時の OpenCV.js キャッシュ（初回はオンライン前提）
- 牌効率以外（認識パイプライン）の WASM 化
- iOS Safari 向けネイティブラッパー
