import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ErrorMessage } from './ErrorMessage';
import { Loading } from './Loading';
import { spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';

/**
 * ErrorHandlingDemo Component
 *
 * Demonstrates the usage of ErrorMessage and Loading components.
 * This is a reference component showing best practices for error handling.
 *
 * Usage patterns demonstrated:
 * - Loading states with different sizes
 * - Error messages with retry functionality
 * - Error messages with dismissal
 * - Network error simulation
 */
export function ErrorHandlingDemo() {
  const { colors } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSize, setLoadingSize] = useState<'small' | 'medium' | 'large'>('medium');

  const containerStyle: CSSProperties = {
    padding: spacing['2xl'],
    maxWidth: '900px',
    margin: '0 auto',
  };

  const headerStyle: CSSProperties = {
    marginBottom: spacing.xl,
  };

  const titleStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  };

  const sectionStyle: CSSProperties = {
    marginBottom: spacing['2xl'],
    padding: spacing.xl,
    backgroundColor: colors.bgSecondary,
    borderRadius: borderRadius.lg,
    border: `1px solid ${colors.border}`,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  };

  const buttonGroupStyle: CSSProperties = {
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    cursor: 'pointer',
  };

  const simulateLoading = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const simulateError = () => {
    setIsLoading(false);
    setError('Failed to fetch data from the server');
  };

  const simulateNetworkError = () => {
    setIsLoading(false);
    setError('Network connection lost. Please check your internet connection.');
  };

  const handleRetry = () => {
    setError(null);
    simulateLoading();
  };

  const handleDismiss = () => {
    setError(null);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Error Handling Demo</h1>
        <p style={subtitleStyle}>
          Interactive demonstration of Loading and ErrorMessage components
        </p>
      </div>

      {/* Loading States Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Loading States</h2>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle}
            onClick={() => {
              setLoadingSize('small');
              simulateLoading();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Small Loading
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              setLoadingSize('medium');
              simulateLoading();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Medium Loading
          </button>
          <button
            style={buttonStyle}
            onClick={() => {
              setLoadingSize('large');
              simulateLoading();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Large Loading
          </button>
        </div>

        {isLoading && <Loading message="Loading data..." size={loadingSize} />}
      </div>

      {/* Error States Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Error States</h2>
        <div style={buttonGroupStyle}>
          <button
            style={buttonStyle}
            onClick={simulateError}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Simulate Error
          </button>
          <button
            style={buttonStyle}
            onClick={simulateNetworkError}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            Simulate Network Error
          </button>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={handleRetry}
            onDismiss={handleDismiss}
          />
        )}
      </div>

      {/* Usage Examples Section */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Usage Examples</h2>
        <pre
          style={{
            backgroundColor: colors.bgCode,
            padding: spacing.lg,
            borderRadius: borderRadius.md,
            fontSize: fontSize.sm,
            color: colors.textPrimary,
            overflowX: 'auto',
            textAlign: 'left'
          }}
        >
          {`// Loading Component
<Loading message="Loading content..." />
<Loading size="small" />
<Loading fullscreen message="Initializing..." />

// ErrorMessage Component
<ErrorMessage
  message="Failed to load data"
  onRetry={() => refetch()}
/>

<ErrorMessage
  message="Network error"
  details="Status: 500, Code: INTERNAL_ERROR"
  onDismiss={() => setError(null)}
/>

// With React Query
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['content'],
  queryFn: fetchContent
});

if (isLoading) return <Loading message="Loading..." />;
if (error) return (
  <ErrorMessage
    message="Failed to load content"
    onRetry={() => refetch()}
  />
);`}
        </pre>
      </div>
    </div>
  );
}
