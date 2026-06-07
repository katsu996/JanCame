# JanCame

ブラウザのカメラ映像から麻雀手牌を認識し、向聴数と打牌候補（受け入れ枚数付き）をリアルタイム表示する Web アプリです。

**本番 URL:** https://katsu996.github.io/JanCame/

## 機能

- Web カメラによるライブ映像表示
- 手牌領域（ROI）の手動調整
- OpenCV.js による輪郭検出 + テンプレートマッチング（34種牌）
- 向聴数・打牌候補・受け入れ牌の計算
- 映像オーバーレイ（牌ラベル・「切」マーク）
- 認識結果の手動補正

## セットアップ

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` を開き、カメラ権限を許可してください。HTTPS または localhost が必要です。

## コマンド

| コマンド | 説明 |
|----------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド（`dist/`、GitHub Pages 用 base path 付き） |
| `pnpm preview` | ビルド成果物のプレビュー（開発用 `/` base） |
| `pnpm preview:pages` | GitHub Pages と同じ `/JanCame/` base でプレビュー |
| `pnpm test` | 牌効率モジュールのユニットテスト |
| `pnpm lint` | Biome による lint + format チェック |
| `pnpm lint:fix` | Biome による自動修正 |

## 使い方

1. カメラに手牌（13〜14枚）を向ける
2. 黄色い ROI ハンドルをドラッグして手牌領域を合わせる
3. 認識された牌ラベルと向聴数を確認
4. 認識ミスは下部パネルの「手動補正」で修正
5. 「切」マークと打牌候補リストから最適打牌を確認

## GitHub Pages デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイします（`.github/workflows/deploy.yml`）。

初回のみ、リポジトリ Settings → Pages → Source を **GitHub Actions** に設定してください。

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
- OpenCV.js（輪郭検出）
- Canvas 2D + DOM
- Vitest 4
- GitHub Pages + GitHub Actions

## ライセンス

MIT
