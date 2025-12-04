import type { CSSProperties } from 'react';
import { colors, spacing, fontSize, fontWeight, borderRadius, fontFamily, transition } from './designTokens';

/**
 * Shared Style Utilities
 *
 * Reusable style objects and style generators to maintain consistency
 * across test components and reduce code duplication.
 */

// Container styles
export const containerStyle: CSSProperties = {
  padding: spacing['3xl'],
  maxWidth: '900px',
  margin: '0 auto',
  minHeight: '100vh',
  fontFamily: fontFamily.base,
};

export const pageHeaderStyle: CSSProperties = {
  marginBottom: spacing['3xl'],
};

export const pageTitleStyle: CSSProperties = {
  fontSize: fontSize['2xl'],
  fontWeight: fontWeight.bold,
  marginBottom: spacing.sm,
  color: colors.textPrimary,
};

export const pageSubtitleStyle: CSSProperties = {
  fontSize: fontSize.md,
  color: colors.primary,
  margin: 0,
};

// Panel/Card styles
export const panelStyle: CSSProperties = {
  padding: spacing.xl,
  backgroundColor: colors.bgSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.lg,
  marginBottom: spacing['2xl'],
};

export const panelHeaderStyle: CSSProperties = {
  margin: `0 0 ${spacing.lg} 0`,
  fontSize: fontSize.lg,
  fontWeight: fontWeight.semibold,
  color: colors.textPrimary,
};

// Form styles
export const formGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: spacing.lg,
};

export const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: fontSize.sm,
  fontWeight: fontWeight.medium,
  marginBottom: spacing.xs,
  color: colors.textSecondary,
};

export const inputStyle: CSSProperties = {
  width: '100%',
  padding: spacing.sm,
  border: `1px solid ${colors.borderInput}`,
  borderRadius: borderRadius.md,
  fontSize: fontSize.base,
  fontFamily: 'inherit',
};

// Button container
export const buttonContainerStyle: CSSProperties = {
  display: 'flex',
  gap: spacing.md,
  flexWrap: 'wrap',
  marginBottom: spacing['2xl'],
};

// Button generators
interface ButtonStyleOptions {
  loading: boolean;
  bgColor: string;
  hoverColor: string;
}

export const createButtonStyle = ({ loading, bgColor }: ButtonStyleOptions): CSSProperties => ({
  padding: `${spacing.md} ${spacing['2xl']}`,
  fontSize: fontSize.md,
  fontWeight: fontWeight.medium,
  cursor: loading ? 'not-allowed' : 'pointer',
  backgroundColor: loading ? colors.bgDisabled : bgColor,
  color: 'white',
  border: 'none',
  borderRadius: borderRadius.lg,
  transition: transition.fast,
  opacity: loading ? 0.6 : 1,
});

export const buttonHoverHandlers = (loading: boolean, bgColor: string, hoverColor: string) => ({
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) e.currentTarget.style.backgroundColor = hoverColor;
  },
  onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) e.currentTarget.style.backgroundColor = bgColor;
  },
});

// Alert/Status styles
export const loadingAlertStyle: CSSProperties = {
  padding: spacing.lg,
  backgroundColor: colors.primaryLight,
  border: `1px solid ${colors.primaryBorder}`,
  borderRadius: borderRadius.lg,
  marginBottom: spacing['2xl'],
  color: colors.textPrimary,
  fontSize: fontSize.base,
};

export const errorAlertStyle: CSSProperties = {
  padding: spacing.xl,
  backgroundColor: colors.errorLight,
  border: `1px solid ${colors.errorBorder}`,
  borderLeft: `4px solid ${colors.error}`,
  borderRadius: borderRadius.lg,
  marginBottom: spacing['2xl'],
};

export const errorHeaderStyle: CSSProperties = {
  margin: `0 0 ${spacing.lg} 0`,
  fontSize: fontSize.xl,
  fontWeight: fontWeight.semibold,
  color: colors.errorHover,
};

export const errorContentStyle: CSSProperties = {
  fontSize: fontSize.md,
  lineHeight: '1.6',
  color: colors.textLabel,
};

export const errorLabelStyle: CSSProperties = {
  color: colors.errorHover,
  fontWeight: fontWeight.semibold,
};

export const errorValueStyle: CSSProperties = {
  color: colors.textMuted,
};

export const successAlertStyle: CSSProperties = {
  padding: spacing.xl,
  backgroundColor: colors.successLight,
  border: `1px solid ${colors.successBorder}`,
  borderLeft: `4px solid ${colors.success}`,
  borderRadius: borderRadius.lg,
  marginBottom: spacing['2xl'],
};

export const successHeaderStyle: CSSProperties = {
  margin: `0 0 ${spacing.lg} 0`,
  fontSize: fontSize.xl,
  fontWeight: fontWeight.semibold,
  color: colors.successDark,
};

export const codeBlockStyle: CSSProperties = {
  margin: 0,
  padding: spacing.lg,
  backgroundColor: colors.bgCode,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.md,
  overflow: 'auto',
  maxHeight: '500px',
  fontSize: fontSize.base,
  lineHeight: '1.6',
  color: colors.textPrimary,
  fontFamily: fontFamily.mono,
  textAlign: 'left',
  whiteSpace: 'pre',
};

export const inlineCodeStyle: CSSProperties = {
  padding: `0.15rem 0.4rem`,
  backgroundColor: colors.bgCodeInline,
  borderRadius: borderRadius.sm,
  fontSize: fontSize.base,
};

export const kbdStyle: CSSProperties = {
  padding: `0.15rem 0.4rem`,
  backgroundColor: colors.textPrimary,
  color: 'white',
  borderRadius: borderRadius.sm,
  fontSize: fontSize.xs,
};

// Instructions panel
export const instructionsPanelStyle: CSSProperties = {
  padding: spacing.xl,
  backgroundColor: colors.bgSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: borderRadius.lg,
};

export const instructionsListStyle: CSSProperties = {
  margin: '0',
  paddingLeft: spacing['2xl'],
  color: colors.textPrimary,
  fontSize: fontSize.base,
  lineHeight: '1.8',
};
