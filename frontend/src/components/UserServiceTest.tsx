import { useState } from 'react';
import {
  createUser,
  getUser,
  getUserProfile,
  updateUserProfile,
  listUsers,
} from '../services/userService';
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
} from '../styles/sharedStyles';

/**
 * User Service Test Component
 *
 * This component provides a UI to test all user service functions.
 * Used for development and integration testing.
 */

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
    executeTest(() => createUser({ username, email, password }), 'Create User');
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
    <div style={containerStyle}>
      {/* Page Header */}
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>👤 User Service Test</h1>
        <p style={pageSubtitleStyle}>
          Test user registration, fetching, and profile management operations
        </p>
      </div>

      {/* Configuration Panel: Create User */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ Create User</h3>

        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button
            onClick={handleCreateUser}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.success, hoverColor: colors.successHover })}
            {...buttonHoverHandlers(loading, colors.success, colors.successHover)}
          >
            Create User
          </button>
        </div>
      </div>

      {/* Configuration Panel: User Operations */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ User Operations</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>User ID</label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            style={{ ...inputStyle, width: '200px' }}
          />
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleGetUser}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
            {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
          >
            Get User
          </button>

          <button
            onClick={handleGetUserProfile}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.info, hoverColor: colors.infoHover })}
            {...buttonHoverHandlers(loading, colors.info, colors.infoHover)}
          >
            Get Profile
          </button>

          <button
            onClick={handleListUsers}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
            {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
          >
            List Users
          </button>
        </div>
      </div>

      {/* Configuration Panel: Update Profile */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ Update User Profile</h3>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Preferred Format</label>
          <select
            value={preferredFormat}
            onChange={(e) => setPreferredFormat(e.target.value as any)}
            style={{ ...inputStyle, width: '200px' }}
          >
            <option value="text">Text</option>
            <option value="visual">Visual</option>
            <option value="video">Video</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>

        <div style={buttonContainerStyle}>
          <button
            onClick={handleUpdateUserProfile}
            disabled={loading}
            style={createButtonStyle({ loading, bgColor: colors.warning, hoverColor: colors.warningHover })}
            {...buttonHoverHandlers(loading, colors.warning, colors.warningHover)}
          >
            Update Profile
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
