import { afterEach, describe, expect, it } from 'vitest';
import { isDebugMode } from '../../src/util/debug-mode.js';

describe('debug mode', () => {
  const originalSearch = window.location.search;

  afterEach(() => {
    window.history.replaceState({}, '', originalSearch || '/');
  });

  it('is enabled when debug=1 query param is set', () => {
    window.history.replaceState({}, '', '?debug=1');
    expect(isDebugMode()).toBe(true);
  });

  it('is disabled without debug query param', () => {
    window.history.replaceState({}, '', '/');
    expect(isDebugMode()).toBe(false);
  });
});
