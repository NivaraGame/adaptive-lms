import { useState } from 'react';
import api from '../services/api';
import type { ApiError } from '../types/api';

/**
 * API Test Component
 *
 * This component tests the API client by making requests to the backend.
 * It verifies:
 * - Successful API calls
 * - Error handling
 * - CORS configuration
 * - Request/response interceptors
 *
 * This is a temporary component for testing purposes and can be removed
 * once the API integration is verified.
 */
/**
 * Format JSON with syntax highlighting
 */
const formatJSON = (data: any): React.ReactElement => {
  const jsonString = JSON.stringify(data, null, 2);

  // Simple syntax highlighting using React elements instead of HTML strings
  const highlighted = jsonString.split('\n').map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Match property keys
    const keyRegex = /"([^"]+)":/g;
    let match;

    // First, handle keys
    const lineWithMarkedKeys = line.replace(keyRegex, (matched, key) => {
      return `__KEY__"${key}"__ENDKEY__:`;
    });

    // Then handle string values (but not keys)
    const lineWithMarkedStrings = lineWithMarkedKeys.replace(
      /: "([^"]*)"/g,
      (matched, value) => {
        return `: __STR__"${value}"__ENDSTR__`;
      }
    );

    // Handle numbers
    const lineWithMarkedNumbers = lineWithMarkedStrings.replace(
      /: (\d+\.?\d*)([,\s]|$)/g,
      (matched, num, after) => {
        return `: __NUM__${num}__ENDNUM__${after}`;
      }
    );

    // Handle booleans and null
    const finalLine = lineWithMarkedNumbers.replace(
      /: (true|false|null)([,\s]|$)/g,
      (matched, bool, after) => {
        return `: __BOOL__${bool}__ENDBOOL__${after}`;
      }
    );

    // Now split and render
    const segments = finalLine.split(/(__KEY__|__ENDKEY__|__STR__|__ENDSTR__|__NUM__|__ENDNUM__|__BOOL__|__ENDBOOL__)/);
    let inKey = false;
    let inStr = false;
    let inNum = false;
    let inBool = false;

    segments.forEach((segment, i) => {
      if (segment === '__KEY__') {
        inKey = true;
      } else if (segment === '__ENDKEY__') {
        inKey = false;
      } else if (segment === '__STR__') {
        inStr = true;
      } else if (segment === '__ENDSTR__') {
        inStr = false;
      } else if (segment === '__NUM__') {
        inNum = true;
      } else if (segment === '__ENDNUM__') {
        inNum = false;
      } else if (segment === '__BOOL__') {
        inBool = true;
      } else if (segment === '__ENDBOOL__') {
        inBool = false;
      } else if (segment) {
        if (inKey) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: '#0066cc', fontWeight: 600 }}>
              {segment}
            </span>
          );
        } else if (inStr) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: '#22863a' }}>
              {segment}
            </span>
          );
        } else if (inNum) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: '#d97706' }}>
              {segment}
            </span>
          );
        } else if (inBool) {
          parts.push(
            <span key={`${lineIndex}-${i}`} style={{ color: '#6f42c1' }}>
              {segment}
            </span>
          );
        } else {
          parts.push(<span key={`${lineIndex}-${i}`}>{segment}</span>);
        }
      }
    });

    return <div key={lineIndex}>{parts}</div>;
  });

  return <>{highlighted}</>;
};

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Test fetching content from the backend
   */
  const testGetContent = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get('/api/v1/content', {
        params: {
          limit: 5,
        },
      });
      setResult(response);
      console.log('✅ API Test Success:', response);
    } catch (err) {
      setError(err as ApiError);
      console.error('❌ API Test Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test fetching topics from the backend
   */
  const testGetTopics = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get('/api/v1/content/topics');
      setResult(response);
      console.log('✅ API Test Success:', response);
    } catch (err) {
      setError(err as ApiError);
      console.error('❌ API Test Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Test error handling with invalid endpoint
   */
  const testErrorHandling = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await api.get('/api/v1/invalid-endpoint');
      setResult({ message: 'Unexpected success' });
    } catch (err) {
      setError(err as ApiError);
      console.log('✅ Error handling works correctly:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#213547'
        }}>
          API Client Test
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#646cff',
          margin: 0
        }}>
          Verify frontend-backend connectivity and API client functionality
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={testGetContent}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#535bf2';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#646cff';
          }}
        >
          Test GET Content
        </button>

        <button
          onClick={testGetTopics}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#535bf2';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#646cff';
          }}
        >
          Test GET Topics
        </button>

        <button
          onClick={testErrorHandling}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#d97706';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#f59e0b';
          }}
        >
          Test Error Handling
        </button>
      </div>

      {loading && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(100, 108, 255, 0.1)',
          border: '1px solid rgba(100, 108, 255, 0.3)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          color: '#213547',
          fontSize: '0.95rem'
        }}>
          ⏳ Loading...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.4)',
            borderLeft: '4px solid #dc2626',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#b91c1c'
          }}>
            ❌ Error
          </h3>
          <div style={{ fontSize: '1rem', lineHeight: '1.6', color: '#45566eff' }}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Message:</strong>{' '}
              <span style={{ color: '#6f7988ff' }}>{error.message}</span>
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Status:</strong>{' '}
              <span style={{ color: '#6f7988ff' }}>{error.status}</span>
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Code:</strong>{' '}
              <span style={{ color: '#6f7988ff' }}>{error.code}</span>
            </p>
            {error.details && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Details:</strong>{' '}
                <code style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  color: '#6f7988ff'
                }}>
                  {JSON.stringify(error.details)}
                </code>
              </p>
            )}
          </div>
        </div>
      )}

      {result && !error && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderLeft: '4px solid #22c55e',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#15803d'
          }}>
            ✅ Success
          </h3>
          <pre
            style={{
              margin: 0,
              padding: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '500px',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              color: '#213547',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              textAlign: 'left',
              whiteSpace: 'pre',
            }}
          >
            {formatJSON(result)}
          </pre>
        </div>
      )}

      <div style={{
        padding: '1.25rem',
        backgroundColor: 'rgba(249, 250, 251, 0.8)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#213547'
        }}>
          📋 Instructions
        </h3>
        <ol style={{
          margin: '0',
          paddingLeft: '1.5rem',
          color: '#213547',
          fontSize: '0.95rem',
          lineHeight: '1.8'
        }}>
          <li>Ensure the backend is running at <code style={{
            padding: '0.15rem 0.4rem',
            backgroundColor: 'rgba(100, 108, 255, 0.1)',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>http://localhost:8000</code></li>
          <li>Click <strong>"Test GET Content"</strong> to fetch content items</li>
          <li>Click <strong>"Test GET Topics"</strong> to fetch available topics</li>
          <li>Click <strong>"Test Error Handling"</strong> to verify error interceptor works</li>
          <li>Check browser console <kbd style={{
            padding: '0.15rem 0.4rem',
            backgroundColor: '#213547',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>F12</kbd> for detailed request/response logs</li>
          <li>Verify CORS is working (no CORS errors in console)</li>
        </ol>
      </div>
    </div>
  );
}
