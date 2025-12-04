/**
 * Design System Tokens
 *
 * Centralized design tokens for consistent styling across components.
 * These tokens define the visual language of the application.
 */

export const colors = {
  // Primary colors
  primary: '#646cff',
  primaryHover: '#535bf2',
  primaryLight: 'rgba(100, 108, 255, 0.1)',
  primaryBorder: 'rgba(100, 108, 255, 0.3)',

  // Semantic colors
  success: '#22c55e',
  successHover: '#16a34a',
  successDark: '#15803d',
  successLight: 'rgba(34, 197, 94, 0.1)',
  successBorder: 'rgba(34, 197, 94, 0.3)',

  error: '#dc2626',
  errorHover: '#b91c1c',
  errorLight: 'rgba(220, 38, 38, 0.15)',
  errorBorder: 'rgba(220, 38, 38, 0.4)',

  warning: '#f59e0b',
  warningHover: '#d97706',

  info: '#3b82f6',
  infoHover: '#2563eb',

  purple: '#8b5cf6',
  purpleHover: '#7c3aed',

  // Text colors
  textPrimary: '#213547',
  textSecondary: '#374151',
  textMuted: '#6f7988ff',
  textLabel: '#45566eff',

  // Background colors
  bgPrimary: 'white',
  bgSecondary: 'rgba(249, 250, 251, 0.8)',
  bgCode: 'rgba(255, 255, 255, 0.9)',
  bgCodeInline: 'rgba(100, 108, 255, 0.1)',
  bgDisabled: '#94a3b8',

  // Border colors
  border: 'rgba(0, 0, 0, 0.1)',
  borderInput: 'rgba(0, 0, 0, 0.2)',

  // Syntax highlighting
  syntaxKey: '#0066cc',
  syntaxString: '#22863a',
  syntaxNumber: '#d97706',
  syntaxBoolean: '#6f42c1',
} as const;

export const spacing = {
  xs: '0.375rem',
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
} as const;

export const fontSize = {
  xs: '0.85rem',
  sm: '0.875rem',
  base: '0.95rem',
  md: '1rem',
  lg: '1.1rem',
  xl: '1.25rem',
  '2xl': '2rem',
} as const;

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const borderRadius = {
  sm: '4px',
  md: '6px',
  lg: '8px',
} as const;

export const fontFamily = {
  base: 'system-ui, -apple-system, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
} as const;

export const transition = {
  fast: 'all 0.2s',
} as const;
