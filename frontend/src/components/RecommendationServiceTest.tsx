import { useState } from 'react';
import {
  getRecommendation,
  getRecommendationHistory,
} from '../services/recommendationService';
import type { ApiError } from '../types/api';
import type { DifficultyLevel, ContentFormat } from '../types/content';
import { formatJSON } from '../utils/formatJSON';
import { colors } from '../styles/designTokens';
import {
  containerStyle,
  pageHeaderStyle,
  pageTitleStyle,
  pageSubtitleStyle,
  panelStyle,
  panelHeaderStyle,
  formGridStyle,
  labelStyle,
  inputStyle,
  buttonContainerStyle,
  createButtonStyle,
  buttonHoverHandlers,
  loadingAlertStyle,
  errorAlertStyle,
  errorHeaderStyle,
  errorContentStyle,
  errorLabelStyle,
  errorValueStyle,
  successAlertStyle,
  successHeaderStyle,
  codeBlockStyle,
} from '../styles/sharedStyles';

/**
 * Recommendation Service Test Component
 *
 * This component provides a UI to test all recommendation service functions.
 * Used for development and integration testing of the adaptive learning engine.
 */

export default function RecommendationServiceTest() {
  const [userId, setUserId] = useState<number>(1);
  const [dialogId, setDialogId] = useState<number | undefined>(undefined);
  const [overrideDifficulty, setOverrideDifficulty] = useState<DifficultyLevel | undefined>(undefined);
  const [overrideFormat, setOverrideFormat] = useState<ContentFormat | undefined>(undefined);
  const [historyLimit, setHistoryLimit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const executeTest = async (testFn: () => Promise<any>, operationName: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await testFn();
      setResult(data);
      console.log(`✅ ${operationName} Success:`, data);
    } catch (err) {
      setError(err as ApiError);
      console.error(`❌ ${operationName} Failed:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendation = () => {
    executeTest(
      () => getRecommendation(userId, dialogId, overrideDifficulty, overrideFormat),
      'Get Recommendation'
    );
  };

  const handleGetRecommendationHistory = () => {
    executeTest(() => getRecommendationHistory(userId, historyLimit), 'Get Recommendation History');
  };

  return (
    <div style={containerStyle}>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>🎯 Recommendation Service Test</h1>
        <p style={pageSubtitleStyle}>
          Test adaptive learning engine recommendations and history tracking
        </p>
      </div>

      {/* Configuration Panel: Get Recommendation */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ Get Next Recommendation</h3>

        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>User ID *</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Dialog ID (optional)</label>
            <input
              type="number"
              value={dialogId ?? ''}
              onChange={(e) => setDialogId(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Leave empty for no dialog context"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Override Difficulty (optional)</label>
            <select
              value={overrideDifficulty ?? ''}
              onChange={(e) => setOverrideDifficulty(e.target.value as DifficultyLevel || undefined)}
              style={inputStyle}
            >
              <option value="">None (use adaptive)</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Override Format (optional)</label>
            <select
              value={overrideFormat ?? ''}
              onChange={(e) => setOverrideFormat(e.target.value as ContentFormat || undefined)}
              style={inputStyle}
            >
              <option value="">None (use adaptive)</option>
              <option value="text">Text</option>
              <option value="visual">Visual</option>
              <option value="video">Video</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleGetRecommendation}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
            {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
          >
            Get Recommendation
          </button>
        </div>
      </div>

      {/* Configuration Panel: Recommendation History */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ Get Recommendation History</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>User ID</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            style={{ ...inputStyle, width: '200px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Limit (max 50)</label>
          <input
            type="number"
            value={historyLimit}
            onChange={(e) => setHistoryLimit(Math.min(50, parseInt(e.target.value) || 10))}
            style={{ ...inputStyle, width: '200px' }}
            min={1}
            max={50}
          />
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleGetRecommendationHistory}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.info, hoverColor: colors.infoHover })}
            {...buttonHoverHandlers(loading, colors.info, colors.infoHover)}
          >
            Get History
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && <div style={loadingAlertStyle}>⏳ Loading...</div>}

      {/* Error State */}
      {error && (
        <div style={errorAlertStyle}>
          <h3 style={errorHeaderStyle}>❌ Error</h3>
          <div style={errorContentStyle}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={errorLabelStyle}>Message:</strong>{' '}
              <span style={errorValueStyle}>{error.message}</span>
            </p>
            {error.code && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Code:</strong>{' '}
                <span style={errorValueStyle}>{error.code}</span>
              </p>
            )}
            {error.status && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Status:</strong>{' '}
                <span style={errorValueStyle}>{error.status}</span>
              </p>
            )}
            {error.details && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong style={errorLabelStyle}>Details:</strong>
                <pre style={{ ...codeBlockStyle, marginTop: '0.5rem' }}>
                  {typeof error.details === 'string' ? error.details : formatJSON(error.details)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {result && !error && (
        <div style={successAlertStyle}>
          <h3 style={successHeaderStyle}>✅ Success</h3>
          <pre style={codeBlockStyle}>
            {formatJSON(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
