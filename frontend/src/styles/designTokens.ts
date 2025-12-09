/**
 * Design System Tokens - Adaptive LMS
 *
 * Centralized design tokens for consistent styling across components.
 * Education-focused color palette with dark mode support.
 */

// Light theme colors
export const lightColors = {
  // Primary colors - Warm, engaging educational blue
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  primaryLight: 'rgba(79, 70, 229, 0.1)',
  primaryBorder: 'rgba(79, 70, 229, 0.3)',

  // Secondary accent - Educational orange/amber
  accent: '#f59e0b',
  accentHover: '#d97706',
  accentLight: 'rgba(245, 158, 11, 0.1)',

  // Semantic colors
  success: '#10b981',
  successHover: '#059669',
  successDark: '#047857',
  successLight: 'rgba(16, 185, 129, 0.1)',
  successBorder: 'rgba(16, 185, 129, 0.3)',

  error: '#ef4444',
  errorHover: '#dc2626',
  errorLight: 'rgba(239, 68, 68, 0.15)',
  errorBorder: 'rgba(239, 68, 68, 0.4)',

  warning: '#f59e0b',
  warningHover: '#d97706',
  warningLight: 'rgba(245, 158, 11, 0.1)',

  info: '#3b82f6',
  infoHover: '#2563eb',
  infoLight: 'rgba(59, 130, 246, 0.1)',

  purple: '#8b5cf6',
  purpleHover: '#7c3aed',
  purpleLight: 'rgba(139, 92, 246, 0.1)',

  // Text colors
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textMuted: '#6b7280',
  textLabel: '#374151',

  // Background colors
  bgPrimary: '#ffffff',
  bgSecondary: '#f9fafb',
  bgTertiary: '#f3f4f6',
  bgCode: 'rgba(255, 255, 255, 0.95)',
  bgCodeInline: 'rgba(79, 70, 229, 0.08)',
  bgDisabled: '#9ca3af',
  bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bgGradientSubtle: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',

  // Border colors
  border: 'rgba(0, 0, 0, 0.08)',
  borderMedium: 'rgba(0, 0, 0, 0.12)',
  borderInput: 'rgba(0, 0, 0, 0.15)',

  // Shadow colors
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.08)',
  shadowCardHover: '0 8px 16px rgba(0, 0, 0, 0.12)',

  // Syntax highlighting
  syntaxKey: '#0066cc',
  syntaxString: '#22863a',
  syntaxNumber: '#d97706',
  syntaxBoolean: '#6f42c1',
} as const;

// Dark theme colors
export const darkColors = {
  // Primary colors
  primary: '#6366f1',
  primaryHover: '#818cf8',
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  primaryBorder: 'rgba(99, 102, 241, 0.3)',

  // Secondary accent
  accent: '#fbbf24',
  accentHover: '#f59e0b',
  accentLight: 'rgba(251, 191, 36, 0.15)',

  // Semantic colors
  success: '#34d399',
  successHover: '#10b981',
  successDark: '#059669',
  successLight: 'rgba(52, 211, 153, 0.15)',
  successBorder: 'rgba(52, 211, 153, 0.3)',

  error: '#f87171',
  errorHover: '#ef4444',
  errorLight: 'rgba(248, 113, 113, 0.15)',
  errorBorder: 'rgba(248, 113, 113, 0.3)',

  warning: '#fbbf24',
  warningHover: '#f59e0b',
  warningLight: 'rgba(251, 191, 36, 0.15)',

  info: '#60a5fa',
  infoHover: '#3b82f6',
  infoLight: 'rgba(96, 165, 250, 0.15)',

  purple: '#a78bfa',
  purpleHover: '#8b5cf6',
  purpleLight: 'rgba(167, 139, 250, 0.15)',

  // Text colors
  textPrimary: '#f9fafb',
  textSecondary: '#e5e7eb',
  textMuted: '#9ca3af',
  textLabel: '#d1d5db',

  // Background colors
  bgPrimary: '#111827',
  bgSecondary: '#1f2937',
  bgTertiary: '#374151',
  bgCode: 'rgba(31, 41, 55, 0.95)',
  bgCodeInline: 'rgba(99, 102, 241, 0.15)',
  bgDisabled: '#4b5563',
  bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  bgGradientSubtle: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)',

  // Border colors
  border: 'rgba(255, 255, 255, 0.08)',
  borderMedium: 'rgba(255, 255, 255, 0.12)',
  borderInput: 'rgba(255, 255, 255, 0.15)',

  // Shadow colors
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
  shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)',
  shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)',
  shadowCard: '0 2px 8px rgba(0, 0, 0, 0.3)',
  shadowCardHover: '0 8px 16px rgba(0, 0, 0, 0.4)',

  // Syntax highlighting
  syntaxKey: '#60a5fa',
  syntaxString: '#34d399',
  syntaxNumber: '#fbbf24',
  syntaxBoolean: '#a78bfa',
} as const;

// Default export uses light colors (will be managed by theme context)
export const colors = lightColors;

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
  medium: 'all 0.3s ease',
  slow: 'all 0.5s ease',
} as const;

export const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1400px',
} as const;
