import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { requiresAuth, FEATURE_NAMES, FEATURE_DESCRIPTIONS } from '../lib/features';

const FeatureGate = ({ feature, children, showPrompt = true }) => {
  const { isAuthenticated, isConfigured } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // If Supabase isn't configured, allow access to everything
  if (!isConfigured) {
    return <>{children}</>;
  }

  // If feature doesn't require auth, show it
  if (!requiresAuth(feature)) {
    return <>{children}</>;
  }

  // If user is authenticated, show the feature
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // User is not authenticated and feature requires auth
  const featureName = FEATURE_NAMES[feature] || 'This Feature';
  const featureDescription = FEATURE_DESCRIPTIONS[feature] || 'This feature requires an account.';

  // If showPrompt is false, just return null (hide feature completely)
  if (!showPrompt) {
    return null;
  }

  // Show locked state with prompt
  return (
    <div
      style={{
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => setShowAuthPrompt(true)}
    >
      {/* Blurred/disabled version of content */}
      <div
        style={{
          filter: 'blur(2px)',
          opacity: 0.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Lock overlay */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          color: 'white',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          minWidth: '280px',
          maxWidth: '90%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 10,
        }}
      >
        <Lock
          size={32}
          style={{
            margin: '0 auto 12px',
            color: '#f59e0b',
          }}
        />
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
          }}
        >
          Sign in to unlock
        </h3>
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: '#d1d5db',
            lineHeight: 1.5,
          }}
        >
          {featureDescription}
        </p>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Open auth modal in sign up mode
              // eslint-disable-next-line no-undef
              window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'signup' } }));
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Sign Up
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Open auth modal in login mode
              // eslint-disable-next-line no-undef
              window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { mode: 'login' } }));
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid white',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;
