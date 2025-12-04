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
  inlineCodeStyle,
  kbdStyle,
} from '../styles/sharedStyles';

/**
 * Dialog Service Test Component
 *
 * This component provides a UI to test all dialog service functions.
 * Used for development and integration testing.
 */

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
      if (result && result.dialog_id) {
        setDialogId(result.dialog_id);
      }
    });
  };

  const handleGetDialog = () => {
    executeTest(() => getDialog(dialogId), 'Get Dialog');
  };

  const handleListUserDialogs = () => {
    executeTest(() => listUserDialogs(userId, 0, 10), 'List User Dialogs');
  };

  const handleGetDialogMessages = () => {
    executeTest(() => getDialogMessages(dialogId), 'Get Dialog Messages');
  };

  const handleSendMessage = () => {
    executeTest(() => sendMessage(dialogId, messageContent, 'user', false), 'Send Message');
  };

  const handleEndDialog = () => {
    executeTest(() => endDialog(dialogId), 'End Dialog');
  };

  return (
    <div style={containerStyle}>
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>Dialog Service Test</h1>
        <p style={pageSubtitleStyle}>Test dialog management and message operations</p>
      </div>

      {/* Configuration Panel */}
      <div style={panelStyle}>
        <h3 style={panelHeaderStyle}>⚙️ Configuration</h3>
        <div style={formGridStyle}>
          <div>
            <label style={labelStyle}>User ID</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Dialog ID</label>
            <input
              type="number"
              value={dialogId}
              onChange={(e) => setDialogId(Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Dialog Type</label>
            <select
              value={dialogType}
              onChange={(e) => setDialogType(e.target.value as DialogType)}
              style={inputStyle}
            >
              <option value="educational">Educational</option>
              <option value="test">Test</option>
              <option value="assessment">Assessment</option>
              <option value="reflective">Reflective</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Message Content</label>
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div style={buttonContainerStyle}>
        <button
          onClick={handleCreateDialog}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.success, hoverColor: colors.successHover })}
          {...buttonHoverHandlers(loading, colors.success, colors.successHover)}
        >
          Create Dialog
        </button>

        <button
          onClick={handleGetDialog}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          Get Dialog
        </button>

        <button
          onClick={handleListUserDialogs}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          List Dialogs
        </button>

        <button
          onClick={handleGetDialogMessages}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.primary, hoverColor: colors.primaryHover })}
          {...buttonHoverHandlers(loading, colors.primary, colors.primaryHover)}
        >
          Get Messages
        </button>

        <button
          onClick={handleSendMessage}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.info, hoverColor: colors.infoHover })}
          {...buttonHoverHandlers(loading, colors.info, colors.infoHover)}
        >
          Send Message
        </button>

        <button
          onClick={handleEndDialog}
          disabled={loading}
          style={createButtonStyle({ loading, bgColor: colors.error, hoverColor: colors.errorHover })}
          {...buttonHoverHandlers(loading, colors.error, colors.errorHover)}
        >
          End Dialog
        </button>
      </div>

      {/* Loading Indicator */}
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
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={errorLabelStyle}>Status:</strong>{' '}
              <span style={errorValueStyle}>{error.status}</span>
            </p>
            <p style={{ margin: '0.5rem 0' }}>
              <strong style={errorLabelStyle}>Code:</strong>{' '}
              <span style={errorValueStyle}>{error.code}</span>
            </p>
            {error.details && (
              <p style={{ margin: '0.5rem 0' }}>
                <strong style={errorLabelStyle}>Details:</strong>{' '}
                <code style={{ ...inlineCodeStyle, backgroundColor: 'rgba(0, 0, 0, 0.08)', color: colors.textMuted }}>
                  {JSON.stringify(error.details)}
                </code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Result Display */}
      {result && !error && (
        <div style={successAlertStyle}>
          <h3 style={successHeaderStyle}>✅ Success</h3>
          <pre style={codeBlockStyle}>
            {formatJSON(result)}
          </pre>
        </div>
      )}

      {/* Instructions */}
      <div style={instructionsPanelStyle}>
        <h3 style={panelHeaderStyle}>📋 Instructions</h3>
        <ol style={instructionsListStyle}>
          <li>Ensure the backend is running at <code style={inlineCodeStyle}>http://localhost:8000</code></li>
          <li>Create a user first (user_id=1) if not exists</li>
          <li>Click <strong>"Create Dialog"</strong> to start a new learning session</li>
          <li>The dialog ID will auto-update after creation</li>
          <li>Use <strong>"Send Message"</strong> to add messages to the dialog</li>
          <li>Use <strong>"Get Messages"</strong> to retrieve all conversation history</li>
          <li>Click <strong>"End Dialog"</strong> to close the session</li>
          <li>Check browser console <kbd style={kbdStyle}>F12</kbd> for detailed request/response logs</li>
        </ol>
      </div>
    </div>
  );
}
