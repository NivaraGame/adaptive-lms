import type { CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';
import { getDialogId, getSessionDuration } from '../utils/sessionStorage';

function Navigation() {
  const location = useLocation();
  const { theme, colors, toggleTheme } = useTheme();
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const isLearning = location.pathname === '/learn';
  const hasActiveSession = getDialogId() !== null;

  // Update session duration every minute when on learning page
  useEffect(() => {
    if (isLearning && hasActiveSession) {
      setSessionDuration(getSessionDuration());
      const interval = setInterval(() => {
        setSessionDuration(getSessionDuration());
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [isLearning, hasActiveSession]);

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
    gap: spacing.lg,
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
  };

  const createLinkStyle = (isActive: boolean): CSSProperties => ({
    color: isActive ? colors.primary : colors.textSecondary,
    textDecoration: 'none',
    fontSize: fontSize.base,
    fontWeight: isActive ? fontWeight.semibold : fontWeight.medium,
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: borderRadius.md,
    backgroundColor: isActive ? colors.primaryLight : 'transparent',
    borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
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

  const sessionIndicatorStyle: CSSProperties = {
    backgroundColor: colors.successLight,
    color: colors.success,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    border: `1px solid ${colors.success}`,
  };

  // Format session duration as "Xh Ym" or "Xm"
  const formatDuration = (minutes: number): string => {
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
            style={createLinkStyle(location.pathname === '/' || location.pathname === '/dashboard')}
            onMouseEnter={(e) => {
              if (location.pathname !== '/' && location.pathname !== '/dashboard') {
                e.currentTarget.style.backgroundColor = colors.bgTertiary;
              }
            }}
            onMouseLeave={(e) => {
              if (location.pathname !== '/' && location.pathname !== '/dashboard') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            aria-label="Dashboard"
          >
            <span aria-hidden="true">📊</span>
            <span>Dashboard</span>
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
            aria-label="Learn"
          >
            <span aria-hidden="true">🎓</span>
            <span>Learn</span>
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
            aria-label="Profile"
          >
            <span aria-hidden="true">👤</span>
            <span>Profile</span>
          </Link>
          {isLearning && hasActiveSession && (
            <div style={sessionIndicatorStyle} aria-live="polite">
              <span aria-hidden="true">⏱️</span>
              <span>Session Active · {formatDuration(sessionDuration)}</span>
            </div>
          )}
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
