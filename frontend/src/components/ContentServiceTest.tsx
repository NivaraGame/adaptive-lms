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

// JSON formatting utility with syntax highlighting
const formatJSON = (data: any): React.ReactElement => {
  const jsonString = JSON.stringify(data, null, 2);

  const highlighted = jsonString.split('\n').map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    const keyRegex = /"([^"]+)":/g;

    const lineWithMarkedKeys = line.replace(keyRegex, (_matched, key) => {
      return `__KEY__"${key}"__ENDKEY__:`;
    });

    const lineWithMarkedStrings = lineWithMarkedKeys.replace(
      /: "([^"]*)"/g,
      (_matched, value) => {
        return `: __STR__"${value}"__ENDSTR__`;
      }
    );

    const lineWithMarkedNumbers = lineWithMarkedStrings.replace(
      /: (\d+\.?\d*)([,\s]|$)/g,
      (_matched, num, after) => {
        return `: __NUM__${num}__ENDNUM__${after}`;
      }
    );

    const finalLine = lineWithMarkedNumbers.replace(
      /: (true|false|null)([,\s]|$)/g,
      (_matched, bool, after) => {
        return `: __BOOL__${bool}__ENDBOOL__${after}`;
      }
    );

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
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#213547'
        }}>
          Content Service Test
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#646cff',
          margin: 0
        }}>
          Test all content service API endpoints
        </p>
      </div>

      {/* Configuration Panel */}
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'rgba(249, 250, 251, 0.8)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          margin: '0 0 1rem 0',
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#213547'
        }}>
          ⚙️ Configuration
        </h3>

        {/* Filter Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., algebra"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Subtopic
            </label>
            <input
              type="text"
              value={subtopic}
              onChange={(e) => setSubtopic(e.target.value)}
              placeholder="e.g., linear-equations"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All</option>
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="challenge">Challenge</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All</option>
              <option value="text">Text</option>
              <option value="visual">Visual</option>
              <option value="video">Video</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All</option>
              <option value="lesson">Lesson</option>
              <option value="exercise">Exercise</option>
              <option value="quiz">Quiz</option>
              <option value="explanation">Explanation</option>
            </select>
          </div>
        </div>

        {/* Pagination and ID Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Limit
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min="1"
              max="100"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Offset
            </label>
            <input
              type="number"
              value={offset}
              onChange={(e) => setOffset(Number(e.target.value))}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Content ID
            </label>
            <input
              type="number"
              value={contentId}
              onChange={(e) => setContentId(Number(e.target.value))}
              min="1"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              User ID
            </label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              min="1"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
          📋 Get Content List
        </button>

        <button
          onClick={testGetContentById}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          🔍 Get By ID
        </button>

        <button
          onClick={testGetRandomContent}
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
          🎲 Get Random
        </button>

        <button
          onClick={testGetTopics}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#16a34a';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#22c55e';
          }}
        >
          📚 Get Topics
        </button>

        <button
          onClick={testGetNextContent}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#7c3aed';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#8b5cf6';
          }}
        >
          ➡️ Get Next Content
        </button>
      </div>

      {/* Loading State */}
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

      {/* Error Display */}
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
            {error.status > 0 && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Status:</strong>{' '}
                <span style={{ color: '#6f7988ff' }}>{error.status}</span>
              </p>
            )}
            {error.code && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Code:</strong>{' '}
                <span style={{ color: '#6f7988ff' }}>{error.code}</span>
              </p>
            )}
            {error.details && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Details:</strong>{' '}
                <span style={{ color: '#6f7988ff' }}>{JSON.stringify(error.details)}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Display */}
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
          <pre style={{
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
          }}>
            {formatJSON(result)}
          </pre>
        </div>
      )}

      {/* Instructions Panel */}
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
          <li>Configure filters using the form above (optional)</li>
          <li>Click a button to test the corresponding content service function</li>
          <li>View results in the success panel or errors in the error panel</li>
          <li>Check browser console for detailed logging</li>
          <li>
            <strong>Get Content List</strong>: Fetch content with filters and pagination
          </li>
          <li>
            <strong>Get By ID</strong>: Fetch a specific content item by its ID
          </li>
          <li>
            <strong>Get Random</strong>: Fetch a random content item (optionally filtered)
          </li>
          <li>
            <strong>Get Topics</strong>: List all available topics in the database
          </li>
          <li>
            <strong>Get Next Content</strong>: Get the next content in a learning sequence
          </li>
        </ol>
      </div>
    </div>
  );
}
