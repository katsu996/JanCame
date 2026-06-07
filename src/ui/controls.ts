import type { InputMode } from '../input/frame-source.js';

export interface HeaderControlsOptions {
  cameraToggle: HTMLInputElement;
  recognitionToggle: HTMLInputElement;
  imageInput: HTMLInputElement;
  clearImageButton: HTMLButtonElement;
  onCameraToggle: (enabled: boolean) => void;
  onRecognitionToggle: (enabled: boolean) => void;
  onImageSelected: (file: File) => void;
  onImageClear: () => void;
}

export function bindHeaderControls(options: HeaderControlsOptions): void {
  options.cameraToggle.addEventListener('change', () => {
    options.onCameraToggle(options.cameraToggle.checked);
    updateCameraLabel(options.cameraToggle);
  });

  options.recognitionToggle.addEventListener('change', () => {
    options.onRecognitionToggle(options.recognitionToggle.checked);
  });

  options.imageInput.addEventListener('change', () => {
    const file = options.imageInput.files?.[0];
    if (file) {
      options.onImageSelected(file);
    }
    options.imageInput.value = '';
  });

  options.clearImageButton.addEventListener('click', () => {
    options.onImageClear();
  });

  updateCameraLabel(options.cameraToggle);
}

export function updateInputModeLabel(
  element: HTMLElement,
  mode: InputMode,
  fileName: string | null,
): void {
  if (mode === 'image' && fileName) {
    element.textContent = `入力: 画像 (${fileName})`;
    return;
  }
  element.textContent = '入力: カメラ';
}

export function setControlsEnabled(enabled: boolean, elements: HTMLElement[]): void {
  for (const element of elements) {
    if (element instanceof HTMLInputElement || element instanceof HTMLButtonElement) {
      element.disabled = !enabled;
    }
  }
}

function updateCameraLabel(toggle: HTMLInputElement): void {
  const label = toggle.closest('label')?.querySelector('span');
  if (label) {
    label.textContent = toggle.checked ? 'カメラ ON' : 'カメラ OFF';
  }
}

export function showOfflineBanner(root: HTMLElement, visible: boolean): void {
  let banner = root.querySelector<HTMLElement>('#offline-banner');
  if (!visible) {
    banner?.classList.add('hidden');
    return;
  }

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.textContent = 'オフラインです。カメラと OpenCV.js はネットワーク接続が必要です。';
    root.prepend(banner);
  }
  banner.classList.remove('hidden');
}
