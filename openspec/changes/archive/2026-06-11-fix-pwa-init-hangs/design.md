# Design: PWA 初期化ハング・カメラ応答・ローディング表示の不具合修正

## Context

```
Bug 1: OpenCV.js 読み込みが終わらない
  ┌─ Symptom: ローディングが 40s+ 続く
  ├─ Cause1: opencv-js@4.10.0 が npm に存在せず CDN 404
  │   → 20s タイムアウト待ち
  ├─ Cause2: Worker 内で loadTileTemplates() が document 未定義で
  │  クラッシュ → onerror 発火 or タイムアウト 20s
  ├─ Cause3: loadTileTemplates が 136 回逐次 fetch (遅い)
  └─ Fix1/Fix2 は前回実施済みだが、ユーザー環境に未反映

Bug 2: カメラ ON/OFF トグルが反応しない
  ┌─ Symptom: スイッチを押してもカメラが起動しない
  ├─ Cause1: initApp 完了前に controlsEnabled=false でスイッチが無効
  ├─ Cause2: カメラ起動エラーが発生しても「カメラ OFF」表示のみ
  └─ Cause3: エラー時も retryCamera が期待通り動作しない

Bug 3: ローディング文言が画面幅を狭めないと見えない
  ┌─ Symptom: ワイド画面で LoadingOverlay が見切れる
  ├─ Cause: aspect-video + max-h-[70vh] のコンテナ内に
  │  absolute 配置されているが overflow-hidden で見切れ
  └─ Fix: コンテナ外に移動し fixed または flex で常に中央表示
```

## Fix 1: 初期化パフォーマンス改善

### loadTileTemplates の並列化

現在は ALL_TILES (136 エントリ) を逐次 fetch。34 種類のユニークな牌のみアセット PNG が存在し、残りは生成テンプレート。重複 ID の fetch は即座に 404 → `createImageBitmap` が throw → catch → drawGeneratedTemplate。

```typescript
// 現在: 逐次
for (const id of ALL_TILES) {
  const asset = await loadAssetTemplate(id);
  // ...
}

// 修正: 一意の ID だけ並列 fetch
const uniqueIds = [...new Set(ALL_TILES)];
const assetResults = await Promise.all(
  uniqueIds.map((id) => loadAssetTemplate(id).catch(() => null))
);
// 重複は Map 経由で合成
```

### Worker 初期化タイムアウト短縮

Worker の `init()` タイムアウトを 20s → **5s** に短縮。Worker 内でテンプレートが読み込めなかった場合（`document` 非対応）、即座に `ready: hasOpenCv=false, templateCount=0` を返す。

```typescript
// worker-client.ts タイムアウト
const timeoutId = window.setTimeout(() => {
  resolve(false);
}, 5_000);  // 20s → 5s
```

## Fix 2: カメラ制御の応答性改善

### handleCameraToggle のエラーハンドリング強化

カメラ ON に失敗した際、エラー文言を `cameraError` に設定し、リトライボタンを表示。リトライ時は `handleCameraToggle(true)` を呼ぶ（既存の `retryCamera` アクション）。

```typescript
const handleCameraToggle = useCallback(async (enabled: boolean) => {
  if (!inputManagerRef.current) return;
  updateState({ cameraError: null });
  try {
    await inputManagerRef.current.setCameraEnabled(enabled);
    if (inputManagerRef.current.getMode() === 'camera') {
      setupFrameCapture();
    }
    updateState({ cameraEnabled: enabled });
  } catch (error) {
    updateState({
      cameraEnabled: false,
      cameraError: inputManagerRef.current.camera.getCameraErrorMessage(error),
    });
  }
}, [updateState, setupFrameCapture]);
```

このコードは既に正しい。問題は `initApp` 完了前にトグルが操作された場合。
→ `controlsEnabled` が `true` になるまでトグルは disabled。問題なし。

### recognitionEnabled と FrameCapture start/stop

`setRecognitionEnabled` アクションで FrameCapture の start/stop を呼ぶ（既存）:

```typescript
setRecognitionEnabled: (enabled) => {
  updateState({ recognitionEnabled: enabled });
  if (enabled) {
    frameCaptureRef.current?.start();
  } else {
    frameCaptureRef.current?.stop();
  }
},
```

**問題**: `frameCaptureRef.current` が null の場合（FrameCapture 未作成）は何も起きない。
**修正**: null の場合は `setupFrameCapture()` を呼んでから start:

```typescript
setRecognitionEnabled: (enabled) => {
  updateState({ recognitionEnabled: enabled });
  if (enabled) {
    if (!frameCaptureRef.current) {
      setupFrameCapture();
    }
    frameCaptureRef.current?.start();
  } else {
    frameCaptureRef.current?.stop();
  }
},
```

## Fix 3: LoadingOverlay とエラー表示のレイアウト改善

### 現在の構造

```
<section.relative.bg-black>
  <div.relative.aspect-video.w-full.max-h-[70vh].overflow-hidden>
    <video />
    <canvas />
    <canvas />
    <div.roiContainer />
    <LoadingOverlay />   ← この中
    {cameraError && <div />}  ← 同上
    {!cameraEnabled && <div />}  ← 同上
  </div>
</section>
```

### 修正構造

LoadingOverlay とエラー/プレースホルダーを `aspect-video` コンテナの外に移動し、`<section>` を基準に `absolute` + `inset-0` で全画面カバー:

```
<section.relative.bg-black>
  <div.relative.aspect-video.w-full.max-h-[70vh].overflow-hidden>
    <video />
    <canvas />
    <canvas />
    <div.roiContainer />
  </div>
  <LoadingOverlay />   ← コンテナの外、section 基準で absolute
  {cameraError && <div />}  ← 同上
  {!cameraEnabled && <div />}  ← 同上
</section>
```

これにより、`aspect-video` の `overflow-hidden` の影響を受けず、常に画面全体に表示される。

## 型定義の修正

変更なし。

## 状態遷移

| 状態 | loading | cameraError | cameraEnabled | 表示 |
|------|---------|-------------|---------------|------|
| 初期化中 | true | null | false | LoadingOverlay（spinner + message） |
| 初期化完了 | false | null | true | カメラ映像／画像プレビュー |
| 初期化エラー | false | "エラー文" | false | エラー表示 + リトライボタン |
| カメラ OFF | false | null | false | 「カメラ OFF」プレースホルダー |

## Risks

| リスク | 対策 |
|--------|------|
| loadTileTemplates 並列化によるメモリ負荷 | 34 個の並列 fetch + canvas 生成で問題なし |
| Worker タイムアウト短縮で正常動作ケースが落ちる | Worker の正常動作には 1-2s で十分、5s は余裕 |
| LoadingOverlay 移動によるレイアウト崩れ | 親 section が `relative`、overlay が `absolute inset-0 z-10` で正しく重なる |
