import { useState } from 'react';
import api from '../services/api';
import type { ApiError } from '../types/api';
import { formatJSON } from '../utils/formatJSON';
import { colors } from '../styles/designTokens';
import { ErrorMessage } from './ErrorMessage';
import { Loading } from './Loading';
import {
  containerStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  buttonContainerStyle,
  createButtonStyle,
  buttonHoverHandlers,
  successAlertStyle,
  successHeaderStyle,
  codeBlockStyle,
  instructionsPanelStyle,
  panelHeaderStyle,
  instructionsListStyle,
  inlineCodeStyle,
  kbdStyle,
} from '../styles/sharedStyles';

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
    <div style={containerStyle}>
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>
          API Client Test
        </h1>
        <p style={pageSubtitleStyle}>
          Verify frontend-backend connectivity and API client functionality
        </p>
      </div>

      <div style={buttonContainerStyle}>
        <button
          onClick={testGetContent}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          Test GET Content
        </button>

        <button
          onClick={testGetTopics}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          Test GET Topics
        </button>

        <button
          onClick={testErrorHandling}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.warning, hoverColor: colors.warningHover })}
          {...buttonHoverHandlers(loading, colors.warning, colors.warningHover)}
        >
          Test Error Handling
        </button>
      </div>

      {loading && <Loading message="Testing API connection..." />}

      {error && (
        <ErrorMessage
          message={error.message}
          details={error.details ? JSON.stringify(error.details, null, 2) : `Status: ${error.status}, Code: ${error.code}`}
          onDismiss={() => setError(null)}
        />
      )}

      {result && !error && (
        <div style={successAlertStyle}>
          <h3 style={successHeaderStyle}>
            ✅ Success
          </h3>
          <pre style={codeBlockStyle}>
            {formatJSON(result)}
          </pre>
        </div>
      )}

      <div style={instructionsPanelStyle}>
        <h3 style={panelHeaderStyle}>
          📋 Instructions
        </h3>
        <ol style={instructionsListStyle}>
          <li>Ensure the backend is running at <code style={inlineCodeStyle}>http://localhost:8000</code></li>
          <li>Click <strong>"Test GET Content"</strong> to fetch content items</li>
          <li>Click <strong>"Test GET Topics"</strong> to fetch available topics</li>
          <li>Click <strong>"Test Error Handling"</strong> to verify error interceptor works</li>
          <li>Check browser console <kbd style={kbdStyle}>F12</kbd> for detailed request/response logs</li>
          <li>Verify CORS is working (no CORS errors in console)</li>
        </ol>
      </div>
    </div>
  );
}
