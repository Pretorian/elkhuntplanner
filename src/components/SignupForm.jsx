import { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignupForm = ({ onSuccess, onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { user, session } = await signUp(email, password);

      // Check if email confirmation is required
      if (!session) {
        setSuccess(true);
        setError('');
        // Don't call onSuccess yet - wait for email confirmation
      } else {
        // Auto-logged in (email confirmation disabled)
        onSuccess?.();
      }
    } catch (err) {
      console.error('Signup error:', err);

      if (err.message?.includes('already registered')) {
        setError('This email is already registered. Try logging in instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
        }}
      >
        <CheckCircle size={48} style={{ color: '#10b981' }} />
        <h2
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 600,
            color: '#1f2937',
          }}
        >
          Check Your Email
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: 1.5,
          }}
        >
          We've sent a confirmation link to <strong>{email}</strong>.
          <br />
          Click the link to activate your account.
        </p>
        <button
          onClick={onSwitchToLogin}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            backgroundColor: '#0ea5e9',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

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
        Create Account
      </h2>
      <p
        style={{
          margin: '0 0 16px 0',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
        }}
      >
        Sign up to save your hunt plans across devices
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
          htmlFor="signup-email"
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
            id="signup-email"
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
          htmlFor="signup-password"
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
            id="signup-password"
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
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          Minimum 6 characters
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label
          htmlFor="signup-confirm-password"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          Confirm Password
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
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <div
        style={{
          marginTop: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280',
        }}
      >
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
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
          Log in
        </button>
      </div>
    </form>
  );
};

export default SignupForm;
