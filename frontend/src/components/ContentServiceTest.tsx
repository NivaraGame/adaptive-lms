import { useState } from 'react';
import {
  getContent,
  getContentById,
  getRandomContent,
  getTopics,
  getNextContent,
  type GetContentParams,
  type ContentFilters,
} from '../services/contentService';
import type { ContentItem, ContentListResponse } from '../types/content';
import type { ApiError } from '../types/api';
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
  instructionsPanelStyle,
  instructionsListStyle,
} from '../styles/sharedStyles';

/**
 * Content Service Test Component
 *
 * Comprehensive test interface for all content service functions:
 * - getContent: List content with filters and pagination
 * - getContentById: Get specific content by ID
 * - getRandomContent: Get random content (optionally filtered)
 * - getTopics: List all available topics
 * - getNextContent: Get next content in sequence
 *
 * Reference: @frontend/.claude/component-style-guide.md for styling patterns
 */

export default function ContentServiceTest() {
  // State management
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ContentItem | ContentListResponse | string[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  // Form state for filters
  const [topic, setTopic] = useState<string>('');
  const [subtopic, setSubtopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [format, setFormat] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [contentId, setContentId] = useState<number>(1);
  const [userId, setUserId] = useState<number>(1);

  // Generic test execution wrapper
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

  // Test: Get content with filters
  const testGetContent = async () => {
    const params: GetContentParams = {
      ...(topic && { topic }),
      ...(subtopic && { subtopic }),
      ...(difficulty && { difficulty: difficulty as any }),
      ...(format && { format: format as any }),
      ...(contentType && { content_type: contentType as any }),
      limit,
      offset,
    };

    await executeTest(
      () => getContent(params),
      `Get Content (${JSON.stringify(params)})`
    );
  };

  // Test: Get content by ID
  const testGetContentById = async () => {
    await executeTest(
      () => getContentById(contentId),
      `Get Content By ID (${contentId})`
    );
  };

  // Test: Get random content
  const testGetRandomContent = async () => {
    const filters: ContentFilters = {
      ...(topic && { topic }),
      ...(difficulty && { difficulty: difficulty as any }),
      ...(format && { format: format as any }),
      ...(contentType && { content_type: contentType as any }),
    };

    await executeTest(
      () => getRandomContent(Object.keys(filters).length > 0 ? filters : undefined),
      `Get Random Content (${JSON.stringify(filters)})`
    );
  };

  // Test: Get topics
  const testGetTopics = async () => {
    await executeTest(
      () => getTopics(),
      'Get Topics'
    );
  };

  // Test: Get next content
  const testGetNextContent = async () => {
    await executeTest(
      () => getNextContent(contentId, userId),
      `Get Next Content (content_id: ${contentId}, user_id: ${userId})`
    );
  };

  return (
    <div style={containerStyle}>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>
          Content Service Test
        </h1>
        <p style={pageSubtitleStyle}>
          Test all content service API endpoints
        </p>
      </div>

      {/* Configuration Panel */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>
          ⚙️ Configuration
        </h3>

        {/* Filter Fields */}
        <div style={{ ...formGridStyle, marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., algebra"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Subtopic</label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., linear-equations"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={inputStyle}>
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} style={inputStyle}>
              <option value="">All</option>
              <option value="text">Text</option>
              <option value="visual">Visual</option>
              <option value="video">Video</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)} style={inputStyle}>
              <option value="">All</option>
              <option value="lesson">Lesson</option>
              <option value="exercise">Exercise</option>
              <option value="quiz">Quiz</option>
              <option value="explanation">Explanation</option>
            </select>
          </div>
        </div>

        {/* Pagination and ID Fields */}
        <div style={{ ...formGridStyle, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div>
            <label style={labelStyle}>Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="1"
              max="100"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Offset</label>
            <input
              type="number"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              min="0"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Content ID</label>
            <input
              type="number"
              value={contentId}
              onChange={(e) => setContentId(Number(e.target.value))}
              min="1"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>User ID</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              min="1"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={buttonContainerStyle}>
        <button
          onClick={testGetContent}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          📋 Get Content List
        </button>

        <button
          onClick={testGetContentById}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.info, hoverColor: colors.infoHover })}
          {...buttonHoverHandlers(loading, colors.info, colors.infoHover)}
        >
          🔍 Get By ID
        </button>

        <button
          onClick={testGetRandomContent}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.warning, hoverColor: colors.warningHover })}
          {...buttonHoverHandlers(loading, colors.warning, colors.warningHover)}
        >
          🎲 Get Random
        </button>

        <button
          onClick={testGetTopics}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.success, hoverColor: colors.successHover })}
          {...buttonHoverHandlers(loading, colors.success, colors.successHover)}
        >
          📚 Get Topics
        </button>

        <button
          onClick={testGetNextContent}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.purple, hoverColor: colors.purpleHover })}
          {...buttonHoverHandlers(loading, colors.purple, colors.purpleHover)}
        >
          ➡️ Get Next Content
        </button>
      </div>

      {/* Loading State */}
      {loading && <div style={loadingAlertStyle}>⏳ Loading...</div>}

      {/* Error Display */}
      {error && (
        <div style={errorAlertStyle}>
          <h3 style={errorHeaderStyle}>❌ Error</h3>
          <div style={errorContentStyle}>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={errorLabelStyle}>Message:</strong>{' '}
              <span style={errorValueStyle}>{error.message}</span>
            </p>
            {error.status > 0 && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Status:</strong>{' '}
                <span style={errorValueStyle}>{error.status}</span>
              </p>
            )}
            {error.code && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Code:</strong>{' '}
                <span style={errorValueStyle}>{error.code}</span>
              </p>
            )}
            {error.details && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Details:</strong>{' '}
                <span style={errorValueStyle}>{JSON.stringify(error.details)}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Display */}
      {result && !error && (
        <div style={successAlertStyle}>
          <h3 style={successHeaderStyle}>✅ Success</h3>
          <pre style={codeBlockStyle}>
            {formatJSON(result)}
          </pre>
        </div>
      )}

      {/* Instructions Panel */}
      <div style={instructionsPanelStyle}>
        <h3 style={panelHeaderStyle}>📋 Instructions</h3>
        <ol style={instructionsListStyle}>
          <li>Configure filters using the form above (optional)</li>
          <li>Click a button to test the corresponding content service function</li>
          <li>View results in the success panel or errors in the error panel</li>
          <li>Check browser console for detailed logging</li>
          <li><strong>Get Content List</strong>: Fetch content with filters and pagination</li>
          <li><strong>Get By ID</strong>: Fetch a specific content item by its ID</li>
          <li><strong>Get Random</strong>: Fetch a random content item (optionally filtered)</li>
          <li><strong>Get Topics</strong>: List all available topics in the database</li>
          <li><strong>Get Next Content</strong>: Get the next content in a learning sequence</li>
        </ol>
      </div>
    </div>
  );
}
