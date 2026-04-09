import { describe, it, expect, beforeEach } from 'vitest';

describe('Storage API', () => {
  beforeEach(() => {
    // Clear storage before each test
    window.storage.data.clear();
  });

  it('should store and retrieve data', async () => {
    const testKey = 'test-key';
    const testValue = { foo: 'bar', count: 42 };

    await window.storage.set(testKey, testValue);
    const result = await window.storage.get(testKey);

    expect(result).toEqual(testValue);
  });

  it('should return undefined for non-existent keys', async () => {
    const result = await window.storage.get('non-existent-key');
    expect(result).toBeUndefined();
  });

  it('should delete stored data', async () => {
    const testKey = 'delete-test';
    const testValue = { data: 'to be deleted' };

    await window.storage.set(testKey, testValue);
    await window.storage.delete(testKey);
    const result = await window.storage.get(testKey);

    expect(result).toBeUndefined();
  });

  it('should clear all stored data', async () => {
    await window.storage.set('key1', 'value1');
    await window.storage.set('key2', 'value2');
    await window.storage.set('key3', 'value3');

    await window.storage.clear();

    const result1 = await window.storage.get('key1');
    const result2 = await window.storage.get('key2');
    const result3 = await window.storage.get('key3');

    expect(result1).toBeUndefined();
    expect(result2).toBeUndefined();
    expect(result3).toBeUndefined();
  });

  it('should handle complex nested objects', async () => {
    const complexData = {
      waypoints: [
        {
          id: 1,
          name: 'Waypoint 1',
          lat: 40.123,
          lng: -107.456,
          category: 'camp',
          notes: 'Test notes',
        },
        {
          id: 2,
          name: 'Waypoint 2',
          lat: 40.789,
          lng: -107.012,
          category: 'water',
          notes: '',
        },
      ],
      metadata: {
        created: new Date().toISOString(),
        version: '1.0',
      },
    };

    await window.storage.set('waypoints-test', complexData);
    const result = await window.storage.get('waypoints-test');

    expect(result).toEqual(complexData);
    expect(result.waypoints).toHaveLength(2);
    expect(result.waypoints[0].lat).toBe(40.123);
  });

  it('should overwrite existing data when setting same key', async () => {
    const key = 'overwrite-test';
    const initialValue = { count: 1 };
    const newValue = { count: 2 };

    await window.storage.set(key, initialValue);
    await window.storage.set(key, newValue);
    const result = await window.storage.get(key);

    expect(result).toEqual(newValue);
    expect(result.count).toBe(2);
  });
});
