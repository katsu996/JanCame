# JanCame

ブラウザのカメラ映像（またはアップロード画像）から麻雀手牌を認識し、向聴数と打牌候補（受け入れ枚数付き）をリアルタイム表示する Web アプリです。

**本番 URL:** https://katsu996.github.io/JanCame/

## 機能

- Web カメラによるライブ映像表示（ON/OFF 切り替え可能）
- テスト用画像アップロード（JPEG/PNG）
- 手牌領域（ROI）の手動調整
- OpenCV.js による輪郭検出 + PNG テンプレートマッチング（34種牌、Web Worker）
- Rust WASM による向聴数・打牌候補・受け入れ牌の計算（失敗時 TypeScript フォールバック）
- 映像オーバーレイ（牌ラベル・「切」マーク）
- 認識結果の手動補正
- PWA 対応（ホーム画面へのインストール、オフライン時メッセージ）

## セットアップ

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` を開き、カメラ権限を許可してください。HTTPS または localhost が必要です。

WASM モジュールは `pnpm dev` / `pnpm build` 実行時に自動ビルドされます。手動ビルドする場合:

```bash
pnpm build:wasm
```

## コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド（`dist/`、GitHub Pages 用 base path 付き） |
| `pnpm generate:templates` | 牌テンプレート PNG 34 枚を再生成 |
| `pnpm build:wasm` | 牌効率 WASM のみビルド（`pkg/tile-efficiency-wasm/`） |
| `pnpm preview` | ビルド成果物のプレビュー（開発用 `/` base） |
| `pnpm preview:pages` | GitHub Pages と同じ `/JanCame/` base でプレビュー |
| `pnpm test` | ユニットテスト（WASM ビルド含む） |
| `pnpm lint` | Biome による lint + format チェック |
| `pnpm lint:fix` | Biome による自動修正 |

## 使い方

1. カメラに手牌（13〜14枚）を向ける（または画像をアップロード）
2. 黄色い ROI ハンドルをドラッグして手牌領域を合わせる
3. 認識された牌ラベルと向聴数を確認
4. 認識ミスは下部パネルの「手動補正」で修正
5. 「切」マークと打牌候補リストから最適打牌を確認

### 牌テンプレート

認識精度向上のため、`public/assets/tiles/` に 34 種 PNG テンプレートを同梱しています。

```bash
pnpm generate:templates
```

自分の牌セットに合わせる場合は、各牌を 48×64 px の PNG として `{id}.png`（例: `1m.png`）で同ディレクトリに配置してください。詳細は `public/assets/tiles/README.md` を参照。

### 実機検証

牌認識の受け入れ確認（認識率 10/14 以上・500 ms 以内など）は [docs/verification/tile-recognition-device.md](docs/verification/tile-recognition-device.md) を参照してください。検証時は URL に `?debug=1` を付けると処理時間と認識枚数が表示されます。

### カメラ ON/OFF

ヘッダーの **カメラ** ボタンでストリームの開始・停止を切り替えられます。カメラ OFF 中も **認識** ボタンは独立して動作します（画像モードで利用可能）。

### 画像アップロード（テスト用）

ヘッダーの **画像を選択** から JPEG/PNG を読み込むと、カメラの代わりに静止画で認識できます。**画像をクリア** でカメラモードに戻ります。入力モードはヘッダーに表示されます。

### PWA インストール

本番環境（GitHub Pages）または `pnpm preview:pages` でアクセスし、ブラウザの「ホーム画面に追加」「アプリとしてインストール」から追加できます。初回アクセス後、オフラインでもアプリシェルは表示されます（OpenCV.js はネットワーク接続が必要）。

## GitHub Pages デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイします（`.github/workflows/pages.yml`）。

初回のみ:

1. リポジトリを **Public** に設定（Private リポジトリは GitHub Pages 非対応）
2. Settings → Pages → Source を **GitHub Actions** に設定

- **Base path:** `/JanCame/`（`vite.config.ts` の production モード）
- **成果物:** `dist/`（`public/.nojekyll` を含む）

ローカルで本番同等のパスを確認する場合:

```bash
pnpm build
pnpm preview:pages
# http://localhost:4173/JanCame/
```

## 制限事項（MVP）

- 映像は端末内のみで処理（サーバー送信なし）
- 牌テンプレートは実行時生成（実牌写真への差し替え推奨）
- 河・他家・ドラ・鳴き牌効率は未対応
- 残り枚数は各牌4枚固定

## 技術スタック

- Vite 8 + TypeScript 5.9
- pnpm 10
- Biome 2
- React 19 + React DOM
- shadcn/ui + Tailwind CSS v4
- lucide-react（アイコン）
- OpenCV.js（輪郭検出）
- Rust WASM（牌効率、`wasm-pack`）
- vite-plugin-pwa
- Canvas 2D + DOM
- Vitest 4 + happy-dom
- GitHub Pages + GitHub Actions

## ライセンス

MIT
