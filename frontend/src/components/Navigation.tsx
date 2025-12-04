import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';

const navStyle: CSSProperties = {
  backgroundColor: colors.textPrimary,
  padding: `${spacing.lg} 0`,
  marginBottom: spacing['3xl'],
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const navContainerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${spacing['3xl']}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle: CSSProperties = {
  fontSize: fontSize.xl,
  fontWeight: fontWeight.bold,
  color: 'white',
  textDecoration: 'none',
};

const navLinksStyle: CSSProperties = {
  display: 'flex',
  gap: spacing.xl,
  alignItems: 'center',
};

const createLinkStyle = (isActive: boolean): CSSProperties => ({
  color: isActive ? colors.primary : 'rgba(255, 255, 255, 0.9)',
  textDecoration: 'none',
  fontSize: fontSize.base,
  fontWeight: isActive ? fontWeight.semibold : fontWeight.medium,
  padding: `${spacing.sm} ${spacing.lg}`,
  borderRadius: borderRadius.md,
  backgroundColor: isActive ? 'rgba(100, 108, 255, 0.2)' : 'transparent',
  transition: 'all 0.2s',
});

function Navigation() {
  const location = useLocation();

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <Link to="/" style={logoStyle}>
          Adaptive LMS
        </Link>
        <div style={navLinksStyle}>
          <Link
            to="/"
            style={createLinkStyle(location.pathname === '/')}
            onMouseEnter={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Home
          </Link>
          <Link
            to="/learn"
            style={createLinkStyle(location.pathname === '/learn')}
            onMouseEnter={(e) => {
              if (location.pathname !== '/learn') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/learn') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Learn
          </Link>
          <Link
            to="/profile"
            style={createLinkStyle(location.pathname === '/profile')}
            onMouseEnter={(e) => {
              if (location.pathname !== '/profile') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/profile') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
