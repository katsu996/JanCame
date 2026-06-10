# Design: 初期表示・カメラ・画像表示の不具合修正

## Context

```
Bug 1: 画面真っ黒
  ┌─ Symptom: 1920x1080 で黒画面
  ├─ Cause: loadTileTemplates() or recognitionWorker.init() の
  │  未キャッチ例外 → loading=true が永続化
  └─ Also: viewport 幅が狭いと LoadingOverlay が見切れる

Bug 2: カメラ起動しない
  ┌─ Symptom: カメラトグル操作→起動しない
  ├─ Cause: initApp 非同期例外で camera.start() が呼ばれない
  │  + videoRef 結合タイミング問題
  └─ Also: setupFrameCapture の依存配列が init useEffect を再実行

Bug 3: 画像表示しない
  ┌─ Symptom: 画像選択→プレビュー黒のまま
  ├─ Cause: image-source drawFrame は complete が必要だが
  │  FileReader/Image ロード後でも isReady が偽になるケース
  └─ Also: previewCanvas の初期化が追いついていない
```

## Fix 1: 初期化の堅牢化

### 現在の問題

`initApp` 内で `loadTileTemplates()` / `recognitionWorker.init()` が throw すると未キャッチになり、`loading` が `true` のまま遷移しない。

```typescript
// 現在
const initApp = async () => {
  updateState({ loading: true });
  templatesRef.current = await loadTileTemplates();  // ← 例外は未キャッチ
  useWorkerRef.current = await recognitionWorker.init(); // ← 同上
  updateState({ loading: false, controlsEnabled: true });
  // camera.start() が呼ばれない
};
```

### 修正

`initApp` 全体を try-catch でラップし、異常時も `loading: false` に遷移させる。エラー内容を `cameraError` 経由で表示。

```typescript
const initApp = async () => {
  updateState({ loading: true, loadingMessage: '認識エンジンを初期化中...' });
  try {
    templatesRef.current = await loadTileTemplates();
    useWorkerRef.current = await recognitionWorker.init();
    if (!useWorkerRef.current) {
      cvModuleRef.current = await loadOpenCv(...);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '初期化エラー';
    updateState({ loading: false, cameraError: message, controlsEnabled: true });
    return;
  }
  updateState({ loading: false, controlsEnabled: true });
  // camera.start()
};
```

## Fix 2: useEffect 依存配列の整理

### 現在の問題

`setupFrameCapture` が `state.recognitionEnabled` を依存に持つため、認識トグル操作ごとに新しい参照が生成され、init useEffect が再実行される。

### 修正

- `initEffect` を `[]` にして biome-ignore (一度だけ実行)
- `setupFrameCapture` も `[]` で安定化し、`stateRef` 経由で常に最新の state を読む
- `recognitionEnabled` 変更時の FrameCapture start/stop は `setRecognitionEnabled` 内で直接制御

```typescript
const setupFrameCapture = useCallback(() => {
  // stateRef.current.recognitionEnabled を使う
}, []);  // ← [] で安定
```

## Fix 3: 画像選択後の描画フロー修正

### 現在の問題

画像選択後、`setupFrameCapture` は呼ばれるが、FrameCapture の `start()` が即座に呼ばれずタイミング問題が発生。

### 修正

`handleImageSelected` 内で FrameCapture の即時起動を保証:

```typescript
const handleImageSelected = useCallback(async (file: File) => {
  ...
  await inputManagerRef.current.loadImageFile(file);
  setupFrameCapture();
  // FrameCapture が即座に captureFrame を実行するよう保証
  frameCaptureRef.current?.start();
}, []);
```

## 型定義の修正

```typescript
// hooks/useJanCame.ts 修正箇所
interface JanCameState {
  // 既存
  loading: boolean;
  loadingMessage: string;
  cameraError: string | null;
  controlsEnabled: boolean;
  // 変更なし
}
```

## 表示条件の整理

CameraViewport の表示状態マトリクス:

| loading | cameraError | cameraEnabled | 表示 |
|---------|------------|---------------|------|
| true    | -          | -             | LoadingOverlay |
| false   | non-null   | -             | エラー表示 |
| false   | null       | true          | 本来のカメラ映像 |
| false   | null       | false         | 「カメラ OFF」プレースホルダー |

現在のコードはこの条件に合致しているが、初期化中断により `loading=true` のまま固まる可能性がある。Fix 1 で対応。

## Risks

| リスク | 対策 |
|--------|------|
| useEffect 依存配列変更による副作用 | 変更は最小限、各修正は独立してテスト |
| 画像選択後も即時認識が走らない | handleImageSelected 内で start 呼び出しを保証 |
| 初期化エラー時も UX を維持 | エラー内容を画面表示、再試行可能に |
