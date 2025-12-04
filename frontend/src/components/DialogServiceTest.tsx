import { useState } from 'react';
import {
  createDialog,
  getDialog,
  listUserDialogs,
  getDialogMessages,
  sendMessage,
  endDialog,
} from '../services/dialogService';
import type { DialogType } from '../types/dialog';
import type { ApiError } from '../types/api';

/**
 * Dialog Service Test Component
 *
 * This component provides a UI to test all dialog service functions.
 * Used for development and integration testing.
 */

/**
 * Format JSON with syntax highlighting
 */
const formatJSON = (data: any): React.ReactElement => {
  const jsonString = JSON.stringify(data, null, 2);

  // Simple syntax highlighting using React elements instead of HTML strings
  const highlighted = jsonString.split('\n').map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];

    // Match property keys
    const keyRegex = /"([^"]+)":/g;

    // First, handle keys
    const lineWithMarkedKeys = line.replace(keyRegex, (_matched, key) => {
      return `__KEY__"${key}"__ENDKEY__:`;
    });

    // Then handle string values (but not keys)
    const lineWithMarkedStrings = lineWithMarkedKeys.replace(
      /: "([^"]*)"/g,
      (_matched, value) => {
        return `: __STR__"${value}"__ENDSTR__`;
      }
    );

    // Handle numbers
    const lineWithMarkedNumbers = lineWithMarkedStrings.replace(
      /: (\d+\.?\d*)([,\s]|$)/g,
      (_matched, num, after) => {
        return `: __NUM__${num}__ENDNUM__${after}`;
      }
    );

    // Handle booleans and null
    const finalLine = lineWithMarkedNumbers.replace(
      /: (true|false|null)([,\s]|$)/g,
      (_matched, bool, after) => {
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

export default function DialogServiceTest() {
  const [userId, setUserId] = useState<number>(1);
  const [dialogId, setDialogId] = useState<number>(1);
  const [dialogType, setDialogType] = useState<DialogType>('educational');
  const [topic, setTopic] = useState<string>('Python basics');
  const [messageContent, setMessageContent] = useState<string>('What is a variable?');
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

  const handleCreateDialog = () => {
    executeTest(
      () => createDialog(userId, dialogType, topic),
      'Create Dialog'
    ).then(() => {
      // Auto-update dialog ID from result if successful
      if (result && result.dialog_id) {
        setDialogId(result.dialog_id);
      }
    });
  };

  const handleGetDialog = () => {
    executeTest(
      () => getDialog(dialogId),
      'Get Dialog'
    );
  };

  const handleListUserDialogs = () => {
    executeTest(
      () => listUserDialogs(userId, 0, 10),
      'List User Dialogs'
    );
  };

  const handleGetDialogMessages = () => {
    executeTest(
      () => getDialogMessages(dialogId),
      'Get Dialog Messages'
    );
  };

  const handleSendMessage = () => {
    executeTest(
      () => sendMessage(dialogId, messageContent, 'user', false),
      'Send Message'
    );
  };

  const handleEndDialog = () => {
    executeTest(
      () => endDialog(dialogId),
      'End Dialog'
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
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#213547'
        }}>
          Dialog Service Test
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#646cff',
          margin: 0
        }}>
          Test dialog management and message operations
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
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
              Dialog ID
            </label>
            <input
              type="number"
              value={dialogId}
              onChange={(e) => setDialogId(Number(e.target.value))}
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
              Dialog Type
            </label>
            <select
              value={dialogType}
              onChange={(e) => setDialogType(e.target.value as DialogType)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontFamily: 'inherit'
              }}
            >
              <option value="educational">Educational</option>
              <option value="test">Test</option>
              <option value="assessment">Assessment</option>
              <option value="reflective">Reflective</option>
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
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Message Content
            </label>
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
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

      {/* Test Buttons */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={handleCreateDialog}
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
          Create Dialog
        </button>

        <button
          onClick={handleGetDialog}
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
          Get Dialog
        </button>

        <button
          onClick={handleListUserDialogs}
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
          List Dialogs
        </button>

        <button
          onClick={handleGetDialogMessages}
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
          Get Messages
        </button>

        <button
          onClick={handleSendMessage}
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
          Send Message
        </button>

        <button
          onClick={handleEndDialog}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            backgroundColor: loading ? '#94a3b8' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = '#ef4444';
          }}
        >
          End Dialog
        </button>
      </div>

      {/* Loading Indicator */}
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

      {/* Success Result Display */}
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

      {/* Instructions */}
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
          <li>Create a user first (user_id=1) if not exists</li>
          <li>Click <strong>"Create Dialog"</strong> to start a new learning session</li>
          <li>The dialog ID will auto-update after creation</li>
          <li>Use <strong>"Send Message"</strong> to add messages to the dialog</li>
          <li>Use <strong>"Get Messages"</strong> to retrieve all conversation history</li>
          <li>Click <strong>"End Dialog"</strong> to close the session</li>
          <li>Check browser console <kbd style={{
            padding: '0.15rem 0.4rem',
            backgroundColor: '#213547',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.85rem'
          }}>F12</kbd> for detailed request/response logs</li>
        </ol>
      </div>
    </div>
  );
}
