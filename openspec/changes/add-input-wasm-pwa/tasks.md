# Tasks: 入力強化・WASM・PWA

## 1. 入力ソース抽象化

- [x] 1.1 `src/input/frame-source.ts` — `FrameSource` インターフェース定義
- [x] 1.2 `src/input/camera-source.ts` — カメラストリームの開始・停止・フレーム取得
- [x] 1.3 `src/input/image-source.ts` — アップロード画像の読み込み・フレーム取得
- [x] 1.4 `src/camera/capture.ts` — FrameSource 対応にリファクタ

## 2. カメラ ON/OFF（camera-capture / ui-overlay）

- [x] 2.1 ヘッダーにカメラ ON/OFF ボタン追加（`index.html` / `src/ui/controls.ts`）
- [x] 2.2 カメラ OFF 時: ストリーム停止・プレースホルダ表示
- [x] 2.3 カメラ ON/OFF と認識 ON/OFF の独立動作を `main.ts` で配線
- [x] 2.4 カメラ OFF + 画像モード時のフレームキャプチャ挙動テスト

## 3. テスト用画像アップロード（image-upload-test）

- [x] 3.1 ファイル入力 UI（JPEG/PNG 限定）追加
- [x] 3.2 画像読み込み → Canvas 描画 → FrameSource 切り替え
- [x] 3.3 画像ロード時の ROI 再スケール
- [x] 3.4 画像クリア → カメラモード復帰
- [x] 3.5 入力モード（カメラ / 画像）のヘッダー表示

## 4. 牌効率 WASM 化（tile-efficiency）

- [x] 4.1 `crates/tile-efficiency-wasm/` — Rust 向聴・受け入れ計算実装
- [x] 4.2 wasm-pack ビルド設定、`pkg/` 出力
- [x] 4.3 `src/efficiency/wasm-loader.ts` — WASM ロード + TS フォールバック
- [x] 4.4 `src/efficiency/index.ts` — WASM 優先、失敗時 TS に切り替え
- [x] 4.5 `tests/efficiency/wasm.test.ts` — TS と WASM 結果一致テスト
- [x] 4.6 `.github/workflows/pages.yml` — Rust/wasm-pack ビルドステップ追加

## 5. PWA 化（pwa）

- [x] 5.1 `vite-plugin-pwa` 導入、`vite.config.ts` 設定（base `/JanCame/` 対応）
- [x] 5.2 アプリアイコン（192, 512）作成・配置
- [x] 5.3 manifest（name, theme_color, start_url, scope）設定
- [x] 5.4 Service Worker — app shell precache 設定
- [x] 5.5 オフライン時のメッセージ UI
- [ ] 5.6 GitHub Pages 上でインストール可能であることを確認

## 6. 統合・品質

- [x] 6.1 `main.ts` 全体配線の整理（入力 → 認識 → 効率 → UI）
- [x] 6.2 `pnpm lint` / `pnpm test` / `pnpm build` 通過確認
- [x] 6.3 README にカメラ OFF・画像アップロード・PWA インストール手順を追記
- [ ] 6.4 実機 / 画像モードでの認識動作確認
