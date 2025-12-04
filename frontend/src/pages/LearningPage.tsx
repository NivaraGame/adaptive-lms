import type { CSSProperties } from 'react';
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
  fontSize: fontSize['2xl'],
  fontWeight: fontWeight.bold,
  color: colors.textPrimary,
  marginBottom: spacing.md,
};

const subtitleStyle: CSSProperties = {
  fontSize: fontSize.lg,
  color: colors.textMuted,
};

const placeholderStyle: CSSProperties = {
  padding: spacing['3xl'],
  backgroundColor: colors.bgSecondary,
  border: `2px dashed ${colors.border}`,
  borderRadius: borderRadius.lg,
  textAlign: 'center',
  color: colors.textMuted,
};

const placeholderTitleStyle: CSSProperties = {
  fontSize: fontSize.xl,
  fontWeight: fontWeight.semibold,
  marginBottom: spacing.lg,
  color: colors.textSecondary,
};

const placeholderTextStyle: CSSProperties = {
  fontSize: fontSize.base,
  lineHeight: '1.6',
};

function LearningPage() {
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Learning Interface</h1>
        <p style={subtitleStyle}>Interactive learning environment</p>
      </header>

      <div style={placeholderStyle}>
        <h2 style={placeholderTitleStyle}>Learning Interface Coming Soon</h2>
        <p style={placeholderTextStyle}>
          This page will contain the interactive learning interface with:<br />
          • Adaptive content delivery<br />
          • Dialog-based interactions<br />
          • Real-time feedback<br />
          • Progress tracking<br />
          <br />
          Implementation scheduled for next week
        </p>
      </div>
    </div>
  );
}

export default LearningPage;
