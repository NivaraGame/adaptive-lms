import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';

const containerStyle: CSSProperties = {
  padding: spacing['3xl'],
  maxWidth: '1200px',
  margin: '0 auto',
  minHeight: '100vh',
};

const headerStyle: CSSProperties = {
  marginBottom: spacing['3xl'],
};

const titleStyle: CSSProperties = {
  fontSize: '3rem',
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
  marginBottom: spacing.lg,
};

const subtitleStyle: CSSProperties = {
  fontSize: fontSize.xl,
  color: colors.textMuted,
  marginBottom: spacing['2xl'],
};

const cardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: spacing['2xl'],
  marginBottom: spacing['3xl'],
};

const cardStyle: CSSProperties = {
  padding: spacing['2xl'],
  backgroundColor: colors.bgSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.lg,
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const cardTitleStyle: CSSProperties = {
  fontSize: fontSize.xl,
  fontWeight: fontWeight.semibold,
  color: colors.textPrimary,
  marginBottom: spacing.lg,
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
  borderRadius: borderRadius.md,
  fontSize: fontSize.base,
  fontWeight: fontWeight.medium,
  transition: 'background-color 0.2s',
};

function HomePage() {
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Adaptive Learning Management System</h1>
        <p style={subtitleStyle}>
          Personalized learning powered by adaptive algorithms
        </p>
      </header>

      <div style={cardGridStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Start Learning</h2>
          <p style={cardDescriptionStyle}>
            Begin your personalized learning journey with content adapted to your skill level and learning pace.
          </p>
          <Link
            to="/learn"
            style={linkButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            Go to Learning Interface
          </Link>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Your Profile</h2>
          <p style={cardDescriptionStyle}>
            View your learning progress, topic mastery, and personalized recommendations.
          </p>
          <Link
            to="/profile"
            style={linkButtonStyle}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primaryHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            View Profile
          </Link>
        </div>

        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>How It Works</h2>
          <p style={cardDescriptionStyle}>
            Our system analyzes your responses and adapts content difficulty, format, and pacing to optimize your learning experience.
          </p>
        </div>
      </div>

      <section style={{ padding: spacing.xl, backgroundColor: colors.bgSecondary, borderRadius: borderRadius.lg }}>
        <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.lg }}>
          Features
        </h3>
        <ul style={{ fontSize: fontSize.base, color: colors.textSecondary, lineHeight: '1.8' }}>
          <li>Adaptive content recommendation based on your performance</li>
          <li>Multiple content formats: text, visual, video, and interactive</li>
          <li>Real-time difficulty adjustment</li>
          <li>Comprehensive topic mastery tracking</li>
          <li>Personalized learning pace</li>
        </ul>
      </section>
    </div>
  );
}

export default HomePage;
