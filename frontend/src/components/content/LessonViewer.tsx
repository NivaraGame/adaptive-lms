/**
 * LessonViewer Component
 *
 * Displays educational lesson content.
 * Renders introduction, sections, and key points from backend.
 *
 * @module components/content/LessonViewer
 */

import type { CSSProperties } from 'react';
import type { ContentItem } from '../../types/content';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, fontSize, fontWeight, borderRadius } from '../../styles/designTokens';
import {
  parseContentData,
  type NormalizedLessonData,
  type NormalizedVisualData,
  type NormalizedVideoData,
} from '../../utils/contentFormatter';

interface LessonViewerProps {
  content: ContentItem;
  onContinue?: () => void;
}

export function LessonViewer({ content, onContinue }: LessonViewerProps) {
  const { colors } = useTheme();

  const parsedContent = parseContentData(content.content_data, content.content_type, content.format);

  const containerStyle: CSSProperties = {
    backgroundColor: colors.bgSecondary,
    borderRadius: '16px',
    padding: spacing['3xl'],
    boxShadow: colors.shadowCard,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
  };

  const titleStyle: CSSProperties = {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  };

  const badgeContainerStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  };

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

  const difficultyColors: Record<string, string> = {
    easy: colors.successLight,
    normal: colors.infoLight,
    hard: colors.warningLight,
    challenge: colors.errorLight,
  };

  const contentSectionStyle: CSSProperties = {
    color: colors.textPrimary,
    fontSize: fontSize.base,
    lineHeight: '1.6',
  };

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

  const listStyle: CSSProperties = {
    paddingLeft: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  };

  const listItemStyle: CSSProperties = {
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  };

  const renderLessonContent = (lessonData: NormalizedLessonData) => {
    return (
      <div style={contentSectionStyle}>
        {lessonData.introduction && (
          <p style={{ marginBottom: spacing.lg, whiteSpace: 'pre-wrap' }}>
            {lessonData.introduction}
          </p>
        )}

        {lessonData.sections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: spacing.lg }}>
            {section.heading && (
              <h3
                style={{
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.semibold,
                  color: colors.textPrimary,
                  marginBottom: spacing.md,
                }}
              >
                {section.heading}
              </h3>
            )}
            <p style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>
          </div>
        ))}

        {lessonData.key_points.length > 0 && (
          <div
            style={{
              backgroundColor: colors.primaryLight,
              padding: spacing.lg,
              borderRadius: borderRadius.lg,
              borderLeft: `4px solid ${colors.primary}`,
              marginTop: spacing.lg,
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
              Key Points
            </h3>
            <ul style={listStyle}>
              {lessonData.key_points.map((point, idx) => (
                <li key={idx} style={listItemStyle}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderVisualContent = (visualData: NormalizedVisualData) => {
    return (
      <div style={contentSectionStyle}>
        {visualData.image_url && (
          <div style={{ marginBottom: spacing.lg }}>
            <img
              src={visualData.image_url}
              alt={visualData.alt_text}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: borderRadius.lg,
                boxShadow: colors.shadowMd,
              }}
            />
            {visualData.caption && (
              <p
                style={{
                  marginTop: spacing.md,
                  fontSize: fontSize.sm,
                  color: colors.textMuted,
                  fontStyle: 'italic',
                  textAlign: 'center',
                }}
              >
                {visualData.caption}
              </p>
            )}
          </div>
        )}
        {visualData.description && (
          <p style={{ marginTop: spacing.md, whiteSpace: 'pre-wrap' }}>{visualData.description}</p>
        )}
      </div>
    );
  };

  const renderVideoContent = (videoData: NormalizedVideoData) => {
    return (
      <div style={contentSectionStyle}>
        {videoData.video_url && (
          <video
            controls
            style={{
              width: '100%',
              maxHeight: '500px',
              borderRadius: borderRadius.lg,
              boxShadow: colors.shadowMd,
            }}
            poster={videoData.thumbnail_url}
          >
            <source src={videoData.video_url} type="video/mp4" />
            {videoData.subtitles && (
              <track kind="subtitles" src={videoData.subtitles} label="English" />
            )}
            Your browser does not support the video tag.
          </video>
        )}
        {videoData.duration && (
          <p
            style={{
              marginTop: spacing.md,
              fontSize: fontSize.sm,
              color: colors.textMuted,
            }}
          >
            Duration: {Math.floor(videoData.duration / 60)}:
            {(videoData.duration % 60).toString().padStart(2, '0')}
          </p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!parsedContent) {
      return (
        <div style={contentSectionStyle}>
          <p style={{ color: colors.textMuted }}>Content data could not be parsed.</p>
        </div>
      );
    }

    if (content.format === 'visual' && 'image_url' in parsedContent) {
      return renderVisualContent(parsedContent);
    }

    if (content.format === 'video' && 'video_url' in parsedContent) {
      return renderVideoContent(parsedContent);
    }

    if ('introduction' in parsedContent) {
      return renderLessonContent(parsedContent);
    }

    return (
      <div style={contentSectionStyle}>
        <p style={{ color: colors.textMuted }}>Unknown content format.</p>
      </div>
    );
  };

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
      <h2 style={titleStyle}>{content.title}</h2>

      <div style={badgeContainerStyle}>
        <span style={getBadgeStyle(colors.accentLight)}>
          {content.topic}
        </span>
        {content.subtopic && (
          <span style={getBadgeStyle(colors.purpleLight)}>
            {content.subtopic}
          </span>
        )}
        <span style={getBadgeStyle(difficultyColors[content.difficulty_level] || colors.infoLight)}>
          {content.difficulty_level}
        </span>
      </div>

      {renderPrerequisites()}
      {renderObjectives()}
      {renderContent()}

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
