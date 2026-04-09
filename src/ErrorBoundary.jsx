import { Component } from 'react';

/**
 * Error Boundary component to catch React rendering errors
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            background: '#182519',
            color: '#e8e4d8',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <h1
            style={{
              color: '#c04a38',
              fontFamily: '"Oswald", sans-serif',
              marginBottom: '16px',
            }}
          >
            Something Went Wrong
          </h1>
          <p style={{ marginBottom: '16px', color: '#98b898' }}>
            The application encountered an error. Please try refreshing the
            page.
          </p>
          <details
            style={{
              background: '#121f16',
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid #2a4032',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                color: '#c47f20',
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: '12px',
              }}
            >
              Error Details
            </summary>
            <pre
              style={{
                marginTop: '12px',
                fontSize: '11px',
                color: '#5e7e60',
                overflow: 'auto',
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              {this.state.error && this.state.error.toString()}
              {this.state.errorInfo &&
                this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              background: '#c47f20',
              color: '#0c1a10',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: '"Oswald", sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
