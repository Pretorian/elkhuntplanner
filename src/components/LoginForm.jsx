import { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm = ({ onSuccess, onSwitchToSignup }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '400px',
      }}
    >
      <h2
        style={{
          margin: '0 0 8px 0',
          fontSize: '24px',
          fontWeight: 600,
          color: '#1f2937',
          textAlign: 'center',
        }}
      >
        Welcome Back
      </h2>
      <p
        style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        Sign in to access your hunt plans
      </p>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="email"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          Email
        </label>
        <div style={{ position: 'relative' }}>
          <Mail
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0ea5e9';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="password"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          Password
        </label>
        <div style={{ position: 'relative' }}>
          <Lock
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#0ea5e9';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#9ca3af' : '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.15s',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#0284c7';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading) {
            e.target.style.backgroundColor = '#0ea5e9';
          }
        }}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <div
        style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
        }}
      >
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          style={{
            background: 'none',
            border: 'none',
            color: '#0ea5e9',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: 0,
            font: 'inherit',
          }}
        >
          Sign up
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
