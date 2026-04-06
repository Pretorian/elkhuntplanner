import React from 'react';
import ReactDOM from 'react-dom/client';
import ElkHuntDashboard from './ElkHuntDashboard';

// Mock storage API for development
if (!window.storage) {
  const mockStorage = new Map();
  window.storage = {
    get: async (key) => {
      const value = mockStorage.get(key);
      return value ? { value } : { value: null };
    },
    set: async (key, value) => {
      mockStorage.set(key, value);
      return true;
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ElkHuntDashboard />
  </React.StrictMode>
);
