/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import { InputManager } from '../../src/input/manager.js';

async function pngFile(name: string): Promise<File> {
  const dataUrl =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z5+BAQAAAP//Aw4BqwAAAABJRU5ErkJggg==';
  const blob = await fetch(dataUrl).then((response) => response.blob());
  return new File([blob], name, { type: 'image/png' });
}

describe('InputManager', () => {
  it('starts in camera mode', () => {
    const video = document.createElement('video');
    const manager = new InputManager(video);
    expect(manager.getMode()).toBe('camera');
  });

  it('switches to image mode and clears camera stream usage', async () => {
    const video = document.createElement('video');
    const manager = new InputManager(video);
    manager.camera.setEnabled(false);

    const invalid = new File([new Uint8Array([1, 2, 3])], 'test.txt', {
      type: 'text/plain',
    });

    await expect(manager.loadImageFile(invalid)).rejects.toThrow('JPEG または PNG');
    expect(manager.getMode()).toBe('camera');
  });

  it('reports image mode after loading a valid image', async () => {
    const video = document.createElement('video');
    const manager = new InputManager(video);

    const file = await pngFile('hand.png');
    await manager.loadImageFile(file);

    expect(manager.getMode()).toBe('image');
    expect(manager.image.getFileName()).toBe('hand.png');
  });

  it('returns to camera mode when image is cleared', async () => {
    const video = document.createElement('video');
    const manager = new InputManager(video);
    manager.camera.setEnabled(false);

    await manager.loadImageFile(await pngFile('hand.png'));
    await manager.clearImage();

    expect(manager.getMode()).toBe('camera');
  });
});
