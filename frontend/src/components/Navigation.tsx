import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';

function Navigation() {
  const location = useLocation();
  const { theme, colors, toggleTheme } = useTheme();

  const navStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    padding: `${spacing.lg} 0`,
    marginBottom: spacing['3xl'],
    boxShadow: colors.shadowMd,
    borderBottom: `1px solid ${colors.border}`,
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
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textDecoration: 'none',
  };

  const navLinksStyle: CSSProperties = {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'center',
  };

  const createLinkStyle = (isActive: boolean): CSSProperties => ({
    color: isActive ? colors.primary : colors.textSecondary,
    textDecoration: 'none',
    fontSize: fontSize.base,
    fontWeight: isActive ? fontWeight.semibold : fontWeight.medium,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    backgroundColor: isActive ? colors.primaryLight : 'transparent',
    transition: 'all 0.2s',
  });

  const themeToggleStyle: CSSProperties = {
    background: colors.bgTertiary,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: `${spacing.sm} ${spacing.md}`,
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    marginLeft: spacing.md,
  };

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
                e.currentTarget.style.backgroundColor = colors.bgTertiary;
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
                e.currentTarget.style.backgroundColor = colors.bgTertiary;
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
                e.currentTarget.style.backgroundColor = colors.bgTertiary;
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
          <button
            onClick={toggleTheme}
            style={themeToggleStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = colors.shadowSm;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
