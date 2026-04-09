import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.storage for tests
globalThis.window = globalThis.window || {};
globalThis.window.storage = {
  data: new Map(),
  async get(key) {
    return this.data.get(key);
  },
  async set(key, value) {
    this.data.set(key, value);
    return value;
  },
  async delete(key) {
    this.data.delete(key);
  },
  async clear() {
    this.data.clear();
  },
};
