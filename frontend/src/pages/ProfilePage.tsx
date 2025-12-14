/**
 * ProfilePage Component
 *
 * Displays user profile information, learning statistics, preferences,
 * and topic mastery overview with edit functionality.
 */

import { useState, useEffect, type CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, transition } from '../styles/designTokens';
import { getUser, getUserProfile, updateUserProfile } from '../services/userService';
import { listUserDialogs } from '../services/dialogService';
import { MasteryIndicator, MasteryIndicatorEmpty } from '../components/metrics/MasteryIndicator';
import type { User, UserProfile } from '../types/user';
import type { Dialog } from '../types/dialog';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';

function ProfilePage() {
  const { colors } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [preferredFormat, setPreferredFormat] = useState<UserProfile['preferred_format']>(null);
  const [learningPace, setLearningPace] = useState<UserProfile['learning_pace']>('medium');
  const [currentDifficulty, setCurrentDifficulty] = useState<UserProfile['current_difficulty']>('normal');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

    let userIdStr = sessionStorage.getItem('userId');

    // ✅ Static user fallback (dev mode)
    if (!userIdStr) {
      userIdStr = '1';
      sessionStorage.setItem('userId', userIdStr);
      console.log('[ProfilePage] Using static userId:', userIdStr);
    }

      const userId = parseInt(userIdStr, 10);

      const [userData, profileData, dialogsData] = await Promise.all([
        getUser(userId),
        getUserProfile(userId),
        listUserDialogs(userId, 0, 100)
      ]);

      setUser(userData);
      setProfile(profileData);
      setDialogs(dialogsData);

      // Initialize editable fields
      setPreferredFormat(profileData.preferred_format);
      setLearningPace(profileData.learning_pace);
      setCurrentDifficulty(profileData.current_difficulty);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      setSaving(true);
      setError(null);

      const updates = {
        preferred_format: preferredFormat,
        learning_pace: learningPace,
        current_difficulty: currentDifficulty
      };

      const updatedProfile = await updateUserProfile(user.user_id, updates);
      setProfile(updatedProfile);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setPreferredFormat(profile.preferred_format);
      setLearningPace(profile.learning_pace);
      setCurrentDifficulty(profile.current_difficulty);
    }
    setEditMode(false);
  };

  // Calculate statistics
  const totalSessions = dialogs.length;
  const completedSessions = dialogs.filter(d => d.ended_at).length;
  const totalTopics = profile ? Object.keys(profile.topic_mastery).length : 0;
  const avgSessionDuration = profile && totalSessions > 0
    ? Math.round(profile.total_time_spent / totalSessions / 60)
    : 0;

  const favoriteTopicEntry = profile
    ? Object.entries(profile.topic_mastery).reduce((max, entry) =>
        entry[1] > max[1] ? entry : max, ['None', 0])
    : ['None', 0];
  const favoriteTopic = favoriteTopicEntry[0];

  // Styles
  const containerStyle: CSSProperties = {
    padding: spacing['3xl'],
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
  };

  const headerStyle: CSSProperties = {
    marginBottom: spacing['3xl'],
  };

  const titleStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  };

  const cardStyle: CSSProperties = {
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: spacing['2xl'],
    marginBottom: spacing['2xl'],
    boxShadow: colors.shadowCard,
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  };

  const statItemStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const statLabelStyle: CSSProperties = {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  };

  const statValueStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor: colors.primary,
    color: colors.textPrimary,
    border: 'none',
    borderRadius: borderRadius.lg,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: 'pointer',
    transition: transition.fast,
  };

  const secondaryButtonStyle: CSSProperties = {
    ...buttonStyle,
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    marginLeft: spacing.md,
  };

  const formGroupStyle: CSSProperties = {
    marginBottom: spacing.xl,
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  };

  const selectStyle: CSSProperties = {
    width: '100%',
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
  };

  const avatarStyle: CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: colors.textPrimary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginRight: spacing.xl,
  };

  const userHeaderStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };

  const userInfoStyle: CSSProperties = {
    flex: 1,
  };

  const masteryGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: spacing.xl,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div style={containerStyle}>
        <ErrorMessage message="Profile data not found" />
      </div>
    );
  }

  const userInitials = user.username.slice(0, 2).toUpperCase();
  const createdDate = new Date(user.created_at).toLocaleDateString();

  // Sort topics by mastery (lowest first for remediation)
  const sortedTopics = Object.entries(profile.topic_mastery).sort((a, b) => a[1] - b[1]);

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>User Profile</h1>
        <p style={subtitleStyle}>Your learning progress and statistics</p>
      </header>

      {/* User Information */}
      <div style={cardStyle}>
        <div style={userHeaderStyle}>
          <div style={avatarStyle}>{userInitials}</div>
          <div style={userInfoStyle}>
            <h2 style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary, margin: 0 }}>
              {user.username}
            </h2>
            <p style={{ fontSize: fontSize.base, color: colors.textSecondary, margin: `${spacing.xs} 0` }}>
              {user.email}
            </p>
            <p style={{ fontSize: fontSize.sm, color: colors.textMuted, margin: 0 }}>
              Member since {createdDate}
            </p>
          </div>
        </div>
      </div>

      {/* Learning Statistics */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Learning Statistics</h2>
        <div style={gridStyle}>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Total Sessions</span>
            <span style={statValueStyle}>{totalSessions}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Completed Sessions</span>
            <span style={statValueStyle}>{completedSessions}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Time Spent</span>
            <span style={statValueStyle}>{Math.round(profile.total_time_spent / 60)}m</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Topics Explored</span>
            <span style={statValueStyle}>{totalTopics}</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Avg Session Duration</span>
            <span style={statValueStyle}>{avgSessionDuration}m</span>
          </div>
          <div style={statItemStyle}>
            <span style={statLabelStyle}>Favorite Topic</span>
            <span style={{ ...statValueStyle, fontSize: fontSize.lg }}>{favoriteTopic}</span>
          </div>
        </div>
      </div>

      {/* User Preferences */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>
          <span>Learning Preferences</span>
          {!editMode ? (
            <button
              style={buttonStyle}
              onClick={() => setEditMode(true)}
            >
              Edit
            </button>
          ) : (
            <div>
              <button
                style={buttonStyle}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                style={secondaryButtonStyle}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </h2>

        <div style={gridStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Preferred Format</label>
            {editMode ? (
              <select
                style={selectStyle}
                value={preferredFormat || ''}
                onChange={(e) => setPreferredFormat(e.target.value as UserProfile['preferred_format'] || null)}
              >
                <option value="">Not set</option>
                <option value="text">Text</option>
                <option value="visual">Visual</option>
                <option value="video">Video</option>
                <option value="interactive">Interactive</option>
              </select>
            ) : (
              <p style={{ ...statValueStyle, fontSize: fontSize.base }}>
                {preferredFormat || 'Not set'}
              </p>
            )}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Learning Pace</label>
            {editMode ? (
              <select
                style={selectStyle}
                value={learningPace}
                onChange={(e) => setLearningPace(e.target.value as UserProfile['learning_pace'])}
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            ) : (
              <p style={{ ...statValueStyle, fontSize: fontSize.base }}>
                {learningPace}
              </p>
            )}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Current Difficulty</label>
            {editMode ? (
              <select
                style={selectStyle}
                value={currentDifficulty}
                onChange={(e) => setCurrentDifficulty(e.target.value as UserProfile['current_difficulty'])}
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="challenge">Challenge</option>
              </select>
            ) : (
              <p style={{ ...statValueStyle, fontSize: fontSize.base }}>
                {currentDifficulty}
              </p>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} />}
      </div>

      {/* Topic Mastery Overview */}
      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Topic Mastery</h2>
        {sortedTopics.length > 0 ? (
          <div style={masteryGridStyle}>
            {sortedTopics.map(([topic, mastery]) => (
              <MasteryIndicator
                key={topic}
                topic={topic}
                mastery={mastery}
              />
            ))}
          </div>
        ) : (
          <MasteryIndicatorEmpty />
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
