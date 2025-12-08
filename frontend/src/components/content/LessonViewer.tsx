/**
 * LessonViewer Component
 *
 * Displays educational lesson content in various formats (text, visual, video, interactive).
 * Renders title, topic badges, difficulty level, and formatted content based on format type.
 *
 * @module components/content/LessonViewer
 */

import type { CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../styles/designTokens';
import {
  parseContentData,
  type ParsedTextContent,
  type ParsedVisualContent,
  type ParsedVideoContent,
  type ParsedInteractiveContent,
} from '../../utils/contentFormatter';

interface LessonViewerProps {
  /**
   * Content item with content_type === 'lesson'
   */
  content: ContentItem;

  /**
   * Callback when user clicks Continue button
   */
  onContinue?: () => void;
}

/**
 * LessonViewer Component
 *
 * Displays lesson content with appropriate formatting based on content format.
 * Supports text, visual, video, and interactive formats.
 *
 * @example
 * ```tsx
 * <LessonViewer
 *   content={lessonContent}
 *   onContinue={() => loadNextContent()}
 * />
 * ```
 */
export function LessonViewer({ content, onContinue }: LessonViewerProps) {
  const { colors } = useTheme();

  const parsedContent = parseContentData(content.content_data, content.format);

  // Container style
  const containerStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    borderRadius: '16px',
    padding: spacing['3xl'],
    boxShadow: colors.shadowCard,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  };

  // Title style
  const titleStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  // Badge container style
  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  };

  // Badge style factory
  const getBadgeStyle = (bgColor: string): CSSProperties => ({
    backgroundColor: bgColor,
    color: colors.textPrimary,
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.xs,
  });

  // Difficulty badge color
  const difficultyColors: Record<string, string> = {
    easy: colors.successLight,
    normal: colors.infoLight,
    hard: colors.warningLight,
    challenge: colors.errorLight,
  };

  // Content section style
  const contentSectionStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
  };

  // Button style
  const buttonStyle: CSSProperties = {
    backgroundColor: colors.primary,
    color: '#ffffff',
    padding: `${spacing.md} ${spacing.xl}`,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  };

  // List style
  const listStyle: CSSProperties = {
    paddingLeft: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  };

  const listItemStyle: CSSProperties = {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  };

  // Render content based on format
  const renderContent = () => {
    if (!parsedContent) {
      return (
        <div style={contentSectionStyle}>
          <p style={{ color: colors.textMuted }}>Content data could not be parsed.</p>
        </div>
      );
    }

    switch (content.format) {
      case 'text': {
        const textContent = parsedContent as ParsedTextContent;
        return (
          <div style={contentSectionStyle}>
            {textContent.text && (
              <div
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: textContent.text.replace(/\n/g, '<br/>'),
                }}
              />
            )}
            {textContent.lists && textContent.lists.length > 0 && (
              <div style={{ marginTop: spacing.lg }}>
                {textContent.lists.map((list, idx) => (
                  <ul key={idx} style={listStyle}>
                    {list.map((item, itemIdx) => (
                      <li key={itemIdx} style={listItemStyle}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'visual': {
        const visualContent = parsedContent as ParsedVisualContent;
        return (
          <div style={contentSectionStyle}>
            {visualContent.image_url && (
              <div style={{ marginBottom: spacing.lg }}>
                <img
                  src={visualContent.image_url}
                  alt={visualContent.alt_text || 'Lesson visual content'}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: borderRadius.lg,
                    boxShadow: colors.shadowMd,
                  }}
                />
                {visualContent.caption && (
                  <p
                    style={{
                      marginTop: spacing.md,
                      fontSize: fontSize.sm,
                      color: colors.textMuted,
                      fontStyle: 'italic',
                      textAlign: 'center',
                    }}
                  >
                    {visualContent.caption}
                  </p>
                )}
              </div>
            )}
            {visualContent.description && (
              <p style={{ marginTop: spacing.md }}>{visualContent.description}</p>
            )}
          </div>
        );
      }

      case 'video': {
        const videoContent = parsedContent as ParsedVideoContent;
        return (
          <div style={contentSectionStyle}>
            {videoContent.video_url && (
              <video
                controls
                style={{
                  width: '100%',
                  maxHeight: '500px',
                  borderRadius: borderRadius.lg,
                  boxShadow: colors.shadowMd,
                }}
                poster={videoContent.thumbnail_url}
              >
                <source src={videoContent.video_url} type="video/mp4" />
                {videoContent.subtitles && (
                  <track kind="subtitles" src={videoContent.subtitles} label="English" />
                )}
                Your browser does not support the video tag.
              </video>
            )}
            {videoContent.duration && (
              <p
                style={{
                  marginTop: spacing.md,
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                }}
              >
                Duration: {Math.floor(videoContent.duration / 60)}:
                {(videoContent.duration % 60).toString().padStart(2, '0')}
              </p>
            )}
          </div>
        );
      }

      case 'interactive': {
        const interactiveContent = parsedContent as ParsedInteractiveContent;
        return (
          <div style={contentSectionStyle}>
            <p style={{ color: colors.textMuted, fontStyle: 'italic' }}>
              Interactive content type: {interactiveContent.type || 'generic'}
            </p>
            {interactiveContent.interactive_elements &&
              interactiveContent.interactive_elements.length > 0 && (
                <div style={{ marginTop: spacing.lg }}>
                  <p style={{ color: colors.textSecondary }}>
                    Interactive elements available: {interactiveContent.interactive_elements.length}
                  </p>
                </div>
              )}
          </div>
        );
      }

      default:
        return (
          <div style={contentSectionStyle}>
            <p style={{ color: colors.textMuted }}>Unknown content format.</p>
          </div>
        );
    }
  };

  // Render learning objectives if present
  const renderObjectives = () => {
    const objectives = content.content_data.objectives;
    if (!objectives || (Array.isArray(objectives) && objectives.length === 0)) {
      return null;
    }

    const objectivesList = Array.isArray(objectives) ? objectives : [objectives];

    return (
      <div
        style={{
          backgroundColor: colors.primaryLight,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          borderLeft: `4px solid ${colors.primary}`,
        }}
      >
        <h3
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          Learning Objectives
        </h3>
        <ul style={listStyle}>
          {objectivesList.map((objective: string, idx: number) => (
            <li key={idx} style={listItemStyle}>
              {objective}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render prerequisites if present
  const renderPrerequisites = () => {
    if (!content.prerequisites || content.prerequisites.length === 0) {
      return null;
    }

    return (
      <div
        style={{
          backgroundColor: colors.infoLight,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          borderLeft: `4px solid ${colors.info}`,
        }}
      >
        <h3
          style={{
            fontSize: fontSize.lg,
            fontWeight: fontWeight.semibold,
            color: colors.textPrimary,
            marginBottom: spacing.md,
          }}
        >
          Prerequisites
        </h3>
        <ul style={listStyle}>
          {content.prerequisites.map((prereq: string, idx: number) => (
            <li key={idx} style={listItemStyle}>
              {prereq}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <article style={containerStyle}>
      {/* Title */}
      <h2 style={titleStyle}>{content.title}</h2>

      {/* Badges */}
      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>
          🎓 {content.topic}
        </span>
        {content.subtopic && (
          <span style={getBadgeStyle(colors.purpleLight)}>
            📚 {content.subtopic}
          </span>
        )}
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
      </div>

      {/* Prerequisites */}
      {renderPrerequisites()}

      {/* Learning Objectives */}
      {renderObjectives()}

      {/* Main Content */}
      {renderContent()}

      {/* Continue Button */}
      {onContinue && (
        <button
          style={buttonStyle}
          onClick={onContinue}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover;
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = colors.shadowMd;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Continue →
        </button>
      )}
    </article>
  );
}
