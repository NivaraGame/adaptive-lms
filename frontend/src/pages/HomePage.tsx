import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../styles/designTokens';
import QueryTest from '../components/QueryTest';

const containerStyle: CSSProperties = {
  padding: spacing['3xl'],
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
};

const headerStyle: CSSProperties = {
  marginBottom: spacing['3xl'],
  textAlign: 'center',
};

const titleGradientStyle: CSSProperties = {
  fontSize: '3rem',
  fontWeight: fontWeight.bold,
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #f59e0b 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: spacing.lg,
  letterSpacing: '-0.02em',
};

const cardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: spacing['2xl'],
  marginBottom: spacing['3xl'],
};

function HomePage() {
  const { colors } = useTheme();

  const subtitleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    color: colors.textMuted,
    marginBottom: spacing['2xl'],
  };

  const modernCardStyle: CSSProperties = {
    padding: spacing['2xl'],
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const cardIconStyle: CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginBottom: spacing.lg,
    background: colors.primaryLight,
    color: colors.primary,
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const cardDescriptionStyle: CSSProperties = {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: '1.6',
    marginBottom: spacing.xl,
  };

  const linkButtonStyle: CSSProperties = {
    display: 'inline-block',
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor: colors.primary,
    color: 'white',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    transition: 'all 0.2s',
    boxShadow: colors.shadowSm,
  };

  const featuresStyle: CSSProperties = {
    padding: spacing['2xl'],
    background: colors.bgGradientSubtle,
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
  };

  const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
    const target = e.currentTarget;
    if (enter) {
      target.style.transform = 'translateY(-4px)';
      target.style.boxShadow = colors.shadowCardHover;
      target.style.borderColor = colors.primaryBorder;
    } else {
      target.style.transform = 'translateY(0)';
      target.style.boxShadow = colors.shadowCard;
      target.style.borderColor = colors.border;
    }
  };

  const handleButtonHover = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    if (enter) {
      e.currentTarget.style.backgroundColor = colors.primaryHover;
      e.currentTarget.style.transform = 'scale(1.02)';
    } else {
      e.currentTarget.style.backgroundColor = colors.primary;
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleGradientStyle}>Adaptive Learning Management System</h1>
        <p style={subtitleStyle}>
          Personalized learning powered by adaptive algorithms
        </p>
      </header>

      <div style={cardGridStyle}>
        <div
          style={modernCardStyle}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
        >
          <div style={cardIconStyle}>🎓</div>
          <h2 style={cardTitleStyle}>Start Learning</h2>
          <p style={cardDescriptionStyle}>
            Begin your personalized learning journey with content adapted to your skill level and learning pace.
          </p>
          <Link
            to="/learn"
            style={linkButtonStyle}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
          >
            Go to Learning Interface
          </Link>
        </div>

        <div
          style={modernCardStyle}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
        >
          <div style={{ ...cardIconStyle, background: colors.successLight, color: colors.success }}>📊</div>
          <h2 style={cardTitleStyle}>Your Profile</h2>
          <p style={cardDescriptionStyle}>
            View your learning progress, topic mastery, and personalized recommendations.
          </p>
          <Link
            to="/profile"
            style={linkButtonStyle}
            onMouseEnter={(e) => handleButtonHover(e, true)}
            onMouseLeave={(e) => handleButtonHover(e, false)}
          >
            View Profile
          </Link>
        </div>

        <div
          style={modernCardStyle}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
        >
          <div style={{ ...cardIconStyle, background: colors.purpleLight, color: colors.purple }}>⚡</div>
          <h2 style={cardTitleStyle}>How It Works</h2>
          <p style={cardDescriptionStyle}>
            Our system analyzes your responses and adapts content difficulty, format, and pacing to optimize your learning experience.
          </p>
        </div>
      </div>

      <section style={featuresStyle}>
        <h3 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.semibold, marginBottom: spacing.lg, color: colors.textPrimary }}>
          ✨ Features
        </h3>
        <ul style={{ fontSize: fontSize.base, color: colors.textSecondary, lineHeight: '1.8', paddingLeft: spacing.xl }}>
          <li>Adaptive content recommendation based on your performance</li>
          <li>Multiple content formats: text, visual, video, and interactive</li>
          <li>Real-time difficulty adjustment</li>
          <li>Comprehensive topic mastery tracking</li>
          <li>Personalized learning pace</li>
        </ul>
      </section>

      <section style={{ ...featuresStyle, marginTop: spacing['2xl'] }}>
        <QueryTest />
      </section>
    </div>
  );
}

export default HomePage;
