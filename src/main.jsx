import React from 'react';
import ReactDOM from 'react-dom/client';
import ElkHuntDashboard from './ElkHuntDashboard';
import ErrorBoundary from './ErrorBoundary';
import './storage'; // Initialize storage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ElkHuntDashboard />
    </ErrorBoundary>
  </React.StrictMode>
);
