/**
 * ProgressChart Component
 *
 * Displays student progress over time using line and bar charts.
 * Supports accuracy tracking and time spent visualization with interactive controls.
 *
 * @module components/metrics/ProgressChart
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, transition } from '../../styles/designTokens';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface AccuracyChartData extends ChartDataPoint {
  accuracy: number;
}

export interface TimeChartData extends ChartDataPoint {
  timeSpent: number;
}

export interface ProgressChartProps {
  /** Data for the chart (accuracy or time spent) */
  data: ChartDataPoint[];
  /** Type of chart to display */
  chartType?: 'accuracy' | 'time';
}

type ChartTypeOption = 'accuracy' | 'time';
type TimeRangeOption = '7d' | '30d' | '90d';

/**
 * Custom tooltip component for charts
 */
function CustomTooltip(props: any) {
  const { colors } = useTheme();
  const { active, payload, label } = props;

  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const tooltipStyle = {
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    boxShadow: colors.shadowMd,
  };

  const labelStyle = {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  };

  const valueStyle = {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  };

  return (
    <div style={tooltipStyle}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>
        {payload[0].name}: {payload[0].value}
        {payload[0].name === 'Accuracy' ? '%' : ' min'}
      </div>
    </div>
  );
}

/**
 * ProgressChart component
 */
export function ProgressChart({ data: initialData, chartType: initialChartType = 'accuracy' }: ProgressChartProps) {
  const { colors } = useTheme();
  const [chartType, setChartType] = useState<ChartTypeOption>(initialChartType);
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30d');

  // Filter data based on time range
  const filteredData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return initialData
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [initialData, timeRange]);

  // Transform data for chart
  const chartData = useMemo(() => {
    return filteredData.map((item) => {
      const date = new Date(item.date);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (chartType === 'accuracy') {
        return {
          date: formattedDate,
          Accuracy: Math.round(item.value),
        };
      } else {
        return {
          date: formattedDate,
          Time: Math.round(item.value),
        };
      }
    });
  }, [filteredData, chartType]);

  const containerStyle = {
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: spacing['2xl'],
    boxShadow: colors.shadowCard,
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    flexWrap: 'wrap' as const,
    gap: spacing.md,
  };

  const titleStyle = {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    margin: 0,
  };

  const controlsStyle = {
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap' as const,
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: spacing.xs,
  };

  const getButtonStyle = (isActive: boolean) => ({
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: isActive ? colors.primary : colors.bgSecondary,
    color: isActive ? 'white' : colors.textSecondary,
    border: `1px solid ${isActive ? colors.primary : colors.border}`,
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    cursor: 'pointer',
    transition: transition.fast,
  });

  const chartContainerStyle = {
    width: '100%',
    height: '300px',
    marginTop: spacing.lg,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {chartType === 'accuracy' ? 'Accuracy Over Time' : 'Time Spent Over Time'}
        </h3>

        <div style={controlsStyle}>
          {/* Chart type toggle */}
          <div style={buttonGroupStyle}>
            <button
              style={getButtonStyle(chartType === 'accuracy')}
              onClick={() => setChartType('accuracy')}
              onMouseEnter={(e) => {
                if (chartType !== 'accuracy') {
                  e.currentTarget.style.backgroundColor = colors.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (chartType !== 'accuracy') {
                  e.currentTarget.style.backgroundColor = colors.bgSecondary;
                }
              }}
            >
              Accuracy
            </button>
            <button
              style={getButtonStyle(chartType === 'time')}
              onClick={() => setChartType('time')}
              onMouseEnter={(e) => {
                if (chartType !== 'time') {
                  e.currentTarget.style.backgroundColor = colors.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (chartType !== 'time') {
                  e.currentTarget.style.backgroundColor = colors.bgSecondary;
                }
              }}
            >
              Time
            </button>
          </div>

          {/* Time range selector */}
          <div style={buttonGroupStyle}>
            <button
              style={getButtonStyle(timeRange === '7d')}
              onClick={() => setTimeRange('7d')}
              onMouseEnter={(e) => {
                if (timeRange !== '7d') {
                  e.currentTarget.style.backgroundColor = colors.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (timeRange !== '7d') {
                  e.currentTarget.style.backgroundColor = colors.bgSecondary;
                }
              }}
            >
              7d
            </button>
            <button
              style={getButtonStyle(timeRange === '30d')}
              onClick={() => setTimeRange('30d')}
              onMouseEnter={(e) => {
                if (timeRange !== '30d') {
                  e.currentTarget.style.backgroundColor = colors.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (timeRange !== '30d') {
                  e.currentTarget.style.backgroundColor = colors.bgSecondary;
                }
              }}
            >
              30d
            </button>
            <button
              style={getButtonStyle(timeRange === '90d')}
              onClick={() => setTimeRange('90d')}
              onMouseEnter={(e) => {
                if (timeRange !== '90d') {
                  e.currentTarget.style.backgroundColor = colors.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (timeRange !== '90d') {
                  e.currentTarget.style.backgroundColor = colors.bgSecondary;
                }
              }}
            >
              90d
            </button>
          </div>
        </div>
      </div>

      <div style={chartContainerStyle}>
        {chartData.length === 0 ? (
          <ProgressChartEmpty chartType={chartType} />
        ) : chartType === 'accuracy' ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="date"
                stroke={colors.textSecondary}
                style={{ fontSize: fontSize.sm }}
              />
              <YAxis
                stroke={colors.textSecondary}
                style={{ fontSize: fontSize.sm }}
                domain={[0, 100]}
                label={{ value: '%', position: 'insideLeft', style: { fill: colors.textSecondary } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Accuracy"
                stroke={colors.success}
                strokeWidth={2}
                dot={{ fill: colors.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="date"
                stroke={colors.textSecondary}
                style={{ fontSize: fontSize.sm }}
              />
              <YAxis
                stroke={colors.textSecondary}
                style={{ fontSize: fontSize.sm }}
                label={{ value: 'min', position: 'insideLeft', style: { fill: colors.textSecondary } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Time" fill={colors.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state component for when there's no chart data
 */
interface ProgressChartEmptyProps {
  chartType: ChartTypeOption;
}

function ProgressChartEmpty({ chartType }: ProgressChartEmptyProps) {
  const { colors } = useTheme();

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: spacing['3xl'],
    textAlign: 'center' as const,
  };

  const iconStyle = {
    fontSize: '48px',
    marginBottom: spacing.lg,
  };

  const titleStyle = {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const descriptionStyle = {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  };

  return (
    <div style={containerStyle}>
      <div style={iconStyle}>📊</div>
      <div style={titleStyle}>No Data Available</div>
      <div style={descriptionStyle}>
        {chartType === 'accuracy'
          ? 'Start learning to track your accuracy over time'
          : 'Start learning to track your study time'}
      </div>
    </div>
  );
}
