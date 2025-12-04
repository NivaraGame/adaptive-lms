import { useState } from 'react';
import {
  createUser,
  getUser,
  getUserProfile,
  updateUserProfile,
  listUsers,
} from '../services/userService';
import type { ApiError } from '../types/api';

/**
 * User Service Test Component
 *
 * This component provides a UI to test all user service functions.
 * Used for development and integration testing.
 */

/**
 * Format JSON with syntax highlighting
 */
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

export default function UserServiceTest() {
  const [username, setUsername] = useState<string>('testuser');
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('password123');
  const [userId, setUserId] = useState<number>(1);
  const [preferredFormat, setPreferredFormat] = useState<'text' | 'visual' | 'video' | 'interactive'>('text');
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

  const handleCreateUser = () => {
    executeTest(
      () => createUser({ username, email, password }),
      'Create User'
    );
  };

  const handleGetUser = () => {
    executeTest(() => getUser(userId), 'Get User');
  };

  const handleGetUserProfile = () => {
    executeTest(() => getUserProfile(userId), 'Get User Profile');
  };

  const handleUpdateUserProfile = () => {
    executeTest(
      () => updateUserProfile(userId, { preferred_format: preferredFormat }),
      'Update User Profile'
    );
  };

  const handleListUsers = () => {
    executeTest(() => listUsers(0, 10), 'List Users');
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          color: '#213547'
        }}>
          👤 User Service Test
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#646cff',
          margin: 0
        }}>
          Test user registration, fetching, and profile management operations
        </p>
      </div>

      {/* Configuration Panel: Create User */}
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
          ⚙️ Create User
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.375rem',
              color: '#374151'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button
            onClick={handleCreateUser}
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
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#16a34a';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#22c55e';
            }}
          >
            Create User
          </button>
        </div>
      </div>

      {/* Configuration Panel: User Operations */}
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
          ⚙️ User Operations
        </h3>

        <div style={{ marginBottom: '1rem' }}>
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
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            style={{
              width: '200px',
              padding: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleGetUser}
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
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#535bf2';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#646cff';
            }}
          >
            Get User
          </button>

          <button
            onClick={handleGetUserProfile}
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
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            Get Profile
          </button>

          <button
            onClick={handleListUsers}
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
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#535bf2';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#646cff';
            }}
          >
            List Users
          </button>
        </div>
      </div>

      {/* Configuration Panel: Update Profile */}
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
          ⚙️ Update User Profile
        </h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.375rem',
            color: '#374151'
          }}>
            Preferred Format
          </label>
          <select
            value={preferredFormat}
            onChange={(e) => setPreferredFormat(e.target.value as any)}
            style={{
              width: '200px',
              padding: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontFamily: 'inherit'
            }}
          >
            <option value="text">Text</option>
            <option value="visual">Visual</option>
            <option value="video">Video</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleUpdateUserProfile}
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
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#d97706';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#f59e0b';
            }}
          >
            Update Profile
          </button>
        </div>
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

      {/* Error State */}
      {error && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(220, 38, 38, 0.15)',
          border: '1px solid rgba(220, 38, 38, 0.4)',
          borderLeft: '4px solid #dc2626',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
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
            {error.code && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Code:</strong>{' '}
                <span style={{ color: '#6f7988ff' }}>{error.code}</span>
              </p>
            )}
            {error.status && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={{ color: '#b91c1c', fontWeight: '600' }}>Status:</strong>{' '}
                <span style={{ color: '#6f7988ff' }}>{error.status}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {result && !error && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderLeft: '4px solid #22c55e',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
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
            whiteSpace: 'pre'
          }}>
            {formatJSON(result)}
          </pre>
        </div>
      )}
    </div>
  );
}
