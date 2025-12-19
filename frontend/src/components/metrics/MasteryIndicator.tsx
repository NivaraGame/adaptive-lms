/**
 * MasteryIndicator Component
 *
 * Displays topic mastery level with color-coded progress bar and label.
 * Supports hover effects, tooltips, and optional subtopic display.
 *
 * @module components/metrics/MasteryIndicator
 */

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius, transition } from '../../styles/designTokens';

export interface MasteryIndicatorProps {
  /** Topic name to display */
  topic: string;
  /** Mastery level (0-1 scale) */
  mastery: number;
  /** Optional subtopics with mastery levels */
  subtopics?: Array<{ name: string; mastery: number }>;
  /** Optional callback when user wants to view details */
  onViewDetails?: () => void;
}

/**
 * Get mastery level label and color based on mastery value
 */
function getMasteryLevel(mastery: number, colors: any) {
  // Clamp mastery to 0-1 range
  const clampedMastery = Math.max(0, Math.min(1, mastery));

  if (clampedMastery < 0.4) {
    return {
      label: 'Struggling',
      color: colors.error,
      bgColor: colors.errorLight,
      borderColor: colors.errorBorder,
    };
  } else if (clampedMastery < 0.7) {
    return {
      label: 'Learning',
      color: colors.warning,
      bgColor: colors.warningLight,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    };
  } else {
    return {
      label: 'Mastered',
      color: colors.success,
      bgColor: colors.successLight,
      borderColor: colors.successBorder,
    };
  }
}

/**
 * MasteryIndicator component
 */
export function MasteryIndicator({
  topic,
  mastery,
  subtopics,
  onViewDetails,
}: MasteryIndicatorProps) {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // Clamp mastery to 0-1 range
  const clampedMastery = Math.max(0, Math.min(1, mastery));
  const masteryLevel = getMasteryLevel(clampedMastery, colors);
  const percentage = Math.round(clampedMastery * 100);

  const containerStyle = {
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: spacing['2xl'],
    boxShadow: isHovered ? colors.shadowCardHover : colors.shadowCard,
    transition: transition.medium,
    cursor: onViewDetails ? 'pointer' : 'default',
    transform: isHovered && onViewDetails ? 'translateY(-2px)' : 'none',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  };

  const topicNameStyle = {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    margin: 0,
    flex: 1,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    marginRight: spacing.md,
  };

  const masteryLabelStyle = {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: masteryLevel.color,
    backgroundColor: masteryLevel.bgColor,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    flexShrink: 0,
  };

  const progressContainerStyle = {
    width: '100%',
    height: '12px',
    backgroundColor: colors.bgTertiary,
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative' as const,
  };

  const progressBarStyle = {
    height: '100%',
    width: `${percentage}%`,
    backgroundColor: masteryLevel.color,
    borderRadius: '6px',
    transition: transition.medium,
    boxShadow: `0 0 8px ${masteryLevel.color}40`,
  };

  const percentageTextStyle = {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  };

  const tooltipStyle = {
    display: isHovered && subtopics && subtopics.length > 0 ? 'block' : 'none',
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
  };

  const subtopicHeaderStyle = {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  };

  const subtopicItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  };

  const subtopicNameStyle = {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  };

  const subtopicValueStyle = {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onViewDetails}
      role={onViewDetails ? 'button' : undefined}
      tabIndex={onViewDetails ? 0 : undefined}
      aria-label={`${topic}: ${percentage}% mastery - ${masteryLevel.label}`}
    >
      <div style={headerStyle}>
        <h3 style={topicNameStyle} title={topic}>{topic}</h3>
        <span style={masteryLabelStyle}>{masteryLevel.label}</span>
      </div>

      <div style={progressContainerStyle}>
        <div style={progressBarStyle} />
      </div>

      <div style={percentageTextStyle}>{percentage}% Complete</div>

      {/* Tooltip for subtopics */}
      {subtopics && subtopics.length > 0 && (
        <div style={tooltipStyle}>
          <div style={subtopicHeaderStyle}>Subtopics:</div>
          {subtopics.map((subtopic, index) => (
            <div key={index} style={subtopicItemStyle}>
              <span style={subtopicNameStyle}>{subtopic.name}</span>
              <span style={subtopicValueStyle}>
                {Math.round(subtopic.mastery * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Empty state component for when there's no mastery data
 */
export function MasteryIndicatorEmpty() {
  const { colors } = useTheme();

  const containerStyle = {
    backgroundColor: colors.bgPrimary,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: spacing['3xl'],
    textAlign: 'center' as const,
    boxShadow: colors.shadowCard,
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
      <div style={iconStyle}>📚</div>
      <div style={titleStyle}>No Mastery Data Yet</div>
      <div style={descriptionStyle}>
        Start learning to track your progress and mastery levels
      </div>
    </div>
  );
}
