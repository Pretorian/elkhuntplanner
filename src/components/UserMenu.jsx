import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) return null;

  // Extract display name or email
  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const email = user.email;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
      }}
    >
      {/* Menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: isOpen ? '#f3f4f6' : 'transparent',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          fontSize: '14px',
          color: '#374151',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.target.style.backgroundColor = '#f9fafb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.target.style.backgroundColor = 'transparent';
          }
        }}
      >
        <User size={18} />
        <span
          style={{
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            minWidth: '200px',
            zIndex: 1000,
          }}
        >
          {/* User info */}
          <div
            style={{
              padding: '12px',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '4px',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {email}
            </div>
          </div>

          {/* Menu items */}
          <div style={{ padding: '4px' }}>
            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#dc2626',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
