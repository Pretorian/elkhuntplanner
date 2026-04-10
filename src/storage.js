/**
 * Storage API for persisting data to localStorage with error handling
 */
import { createLogger } from './logger';

const logger = createLogger('Storage');

class Storage {
  constructor() {
    this.isAvailable = this.checkAvailability();
    if (!this.isAvailable) {
      logger.warn('localStorage is not available. Data will not persist.');
    }
  }

  /**
   * Check if localStorage is available
   */
  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get data from storage
   * @param {string} key - Storage key
   * @returns {Promise<any>} - Parsed data or undefined
   */
  async get(key) {
    if (!this.isAvailable) {
      return undefined;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return undefined;
      }
      return JSON.parse(item);
    } catch (error) {
      logger.error(`Failed to get item "${key}"`, error);
      return undefined;
    }
  }

  /**
   * Set data in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @returns {Promise<any>} - The value that was set
   */
  async set(key, value) {
    if (!this.isAvailable) {
      logger.warn(`Cannot save "${key}" - localStorage unavailable`);
      return value;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return value;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        logger.error(
          `Storage quota exceeded while saving "${key}". Consider clearing old data.`,
          error
        );
      } else {
        logger.error(`Failed to set item "${key}"`, error);
      }
      throw error; // Re-throw so callers can handle it
    }
  }

  /**
   * Delete data from storage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async delete(key) {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to delete item "${key}"`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   * @returns {Promise<void>}
   */
  async clear() {
    if (!this.isAvailable) {
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      logger.error('Failed to clear storage', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storage = new Storage();

// Make it globally available for compatibility
if (typeof window !== 'undefined') {
  window.storage = storage;
}
