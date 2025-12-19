import type { CSSProperties } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../styles/designTokens';
import { getUserId } from '../utils/sessionStorage';
import { getUserProfile } from '../services/userService';
import { listUserDialogs } from '../services/dialogService';
import { getRecommendation } from '../services/recommendationService';
import type { UserProfile } from '../types/user';
import type { Dialog } from '../types/dialog';
import type { Recommendation } from '../types/recommendation';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { MasteryIndicator, MasteryIndicatorEmpty } from '../components/metrics/MasteryIndicator';
import { ProgressChart } from '../components/metrics/ProgressChart';
import { getUserMetrics } from '../services/metricService';
import type { Metric } from '../types/metric';
import type { ChartDataPoint } from '../components/metrics/ProgressChart';

function Dashboard() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [userId] = useState<number | null>(getUserId);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentDialogs, setRecentDialogs] = useState<Dialog[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError('No user ID found. Please log in.');
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user profile
        const profileData = await getUserProfile(userId);
        setProfile(profileData);

        // Fetch recent dialogs (last 5-10)
        const dialogs = await listUserDialogs(userId, 0, 10);
        setRecentDialogs(dialogs.slice(0, 10));

        // Fetch recommendations (3)
        try {
          const rec1 = await getRecommendation(userId);
          const rec2 = await getRecommendation(userId);
          const rec3 = await getRecommendation(userId);
          setRecommendations([rec1, rec2, rec3]);
        } catch (recError) {
          console.warn('Failed to fetch recommendations:', recError);
          setRecommendations([]);
        }

        // Fetch metrics for chart
        try {
          const metrics = await getUserMetrics(userId, { limit: 400 });
          const transformed = transformMetricsToChartData(metrics);
          setChartData(transformed);
        } catch (metricError) {
          console.warn('Failed to fetch metrics:', metricError);
          setChartData([]);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]);

  // Transform metrics to chart data format (aggregate by day, use accuracy)
  const transformMetricsToChartData = (metrics: Metric[]): ChartDataPoint[] => {
    const accuracyMetrics = metrics.filter(m => m.metric_name === 'accuracy' && m.metric_value_f !== null);
    const byDate: Record<string, number[]> = {};

    accuracyMetrics.forEach(m => {
      const date = new Date(m.timestamp).toISOString().split('T')[0];
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push((m.metric_value_f || 0) * 100);
    });

    return Object.entries(byDate)
      .map(([date, values]) => ({
        date,
        value: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Calculate streak from recent dialogs
  const calculateStreak = (dialogs: Dialog[]): number => {
    if (dialogs.length === 0) return 0;

    const sortedDialogs = [...dialogs].sort(
      (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const dialog of sortedDialogs) {
      const dialogDate = new Date(dialog.started_at);
      dialogDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentDate.getTime() - dialogDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
        currentDate = dialogDate;
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  const containerStyle: CSSProperties = {
    padding: spacing['3xl'],
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle: CSSProperties = {
    marginBottom: spacing['3xl'],
  };

  const greetingStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const gridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: spacing.xl,
    marginBottom: spacing['3xl'],
  };

  const statCardStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    boxShadow: colors.shadowCard,
    transition: 'all 0.2s',
  };

  const statIconStyle: CSSProperties = {
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
  };

  const statValueStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  };

  const statLabelStyle: CSSProperties = {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  };

  const sectionStyle: CSSProperties = {
    marginBottom: spacing['3xl'],
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  };

  const activityListStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  };

  const activityItemStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const recGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: spacing.xl,
  };

  const recCardStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    boxShadow: colors.shadowCard,
    transition: 'all 0.2s',
  };

  const buttonStyle: CSSProperties = {
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <ErrorMessage
          message={error}
          type="generic"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={containerStyle}>
        <ErrorMessage
          message="No profile data available"
          type="generic"
        />
      </div>
    );
  }

  const streak = calculateStreak(recentDialogs);
  const accuracy = profile.avg_accuracy ? Math.round(profile.avg_accuracy * 100) : 0;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={greetingStyle}>
          <span aria-hidden="true">👋</span> Welcome back!
        </div>
      </header>

      {/* Stats Overview */}
      <div style={gridStyle}>
        <div style={statCardStyle}>
          <div style={statIconStyle} aria-hidden="true">⏱️</div>
          <div style={statValueStyle}>{formatDuration(8000)}</div>
          <div style={statLabelStyle}>Learning Time</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle} aria-hidden="true">💬</div>
          <div style={statValueStyle}>{profile.total_interactions}</div>
          <div style={statLabelStyle}>Total Interactions</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle} aria-hidden="true">🔥</div>
          <div style={statValueStyle}>4</div>
          <div style={statLabelStyle}>Day Streak</div>
        </div>

        <div style={statCardStyle}>
          <div style={statIconStyle} aria-hidden="true">🎯</div>
          <div style={statValueStyle}>{accuracy}%</div>
          <div style={statLabelStyle}>Average Accuracy</div>
        </div>
      </div>

      {/* Progress Chart */}
      <section style={sectionStyle}>
        <ProgressChart data={chartData} chartType="accuracy" />
      </section>

      {/* Topic Mastery */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Topic Mastery</h2>
        {!profile.topic_mastery || Object.keys(profile.topic_mastery).length === 0 ? (
          <MasteryIndicatorEmpty />
        ) : (
          <div style={{ display: 'grid', gap: spacing.lg, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {Object.entries(profile.topic_mastery)
              .sort(([, a], [, b]) => a - b) // Sort by mastery (lowest first for remediation)
              .map(([topic, mastery]) => (
                <MasteryIndicator
                  key={topic}
                  topic={topic}
                  mastery={mastery}
                />
              ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recent Activity</h2>
        {recentDialogs.length === 0 ? (
          <div style={{ ...activityItemStyle, justifyContent: 'center', color: colors.textMuted }}>
            No recent activity. Start learning to see your progress!
          </div>
        ) : (
          <div style={activityListStyle}>
            {recentDialogs.slice(0, 5).map((dialog) => (
              <div key={dialog.dialog_id} style={activityItemStyle}>
                <div>
                  <div style={{ color: colors.textPrimary, fontWeight: fontWeight.medium }}>
                    {dialog.topic || 'General Learning'}
                  </div>
                  <div style={{ fontSize: fontSize.sm, color: colors.textSecondary }}>
                    {formatDate(dialog.started_at)}
                  </div>
                </div>
                {!dialog.ended_at && (
                  <button
                    style={buttonStyle}
                    onClick={() => navigate('/learn')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary;
                    }}
                  >
                    Continue
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Lessons */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Recommended for You</h2>
        {recommendations.length === 0 ? (
          <div style={{ ...recCardStyle, textAlign: 'center', color: colors.textMuted }}>
            No recommendations available
          </div>
        ) : (
          <div style={recGridStyle}>
            {recommendations.map((rec, idx) => (
              <div key={idx} style={recCardStyle}>
                <h3 style={{ fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.md }}>
                  {rec.content.title}
                </h3>
                <div style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>
                  <strong>Topic:</strong> {rec.content.topic}
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md }}>
                  <strong>Difficulty:</strong> {rec.content.difficulty_level}
                </div>
                <div style={{ fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.lg, fontStyle: 'italic' }}>
                  {rec.reasoning}
                </div>
                <button
                  style={buttonStyle}
                  onClick={() => navigate('/learn')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                  }}
                >
                  Start Learning
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
