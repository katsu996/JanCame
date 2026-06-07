export interface CameraStreamOptions {
  video: HTMLVideoElement;
  facingMode?: 'user' | 'environment';
}

export class CameraError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CameraError';
  }
}

export async function startCameraStream(options: CameraStreamOptions): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraError('このブラウザはカメラ API に対応していません');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: options.facingMode ?? 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    options.video.srcObject = stream;
    await options.video.play();
    return stream;
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new CameraError(
          'カメラへのアクセスが拒否されました。ブラウザ設定を確認してください。',
        );
      }
      if (error.name === 'NotFoundError') {
        throw new CameraError('カメラが見つかりませんでした。');
      }
    }
    throw new CameraError('カメラの起動に失敗しました。');
  }
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    track.stop();
  }
}
