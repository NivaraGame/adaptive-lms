import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing } from '../styles/designTokens';

// Feedback Components
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { ContentSkeleton } from '../components/ContentSkeleton';
import { MessageSkeleton } from '../components/MessageSkeleton';

/**
 * DemoPage - Interactive Component Showroom
 *
 * A comprehensive demonstration page showcasing all reusable components
 * in the adaptive-lms application. Organized into thematic sections for
 * easy browsing and testing.
 *
 * Use this page to:
 * - Preview component appearance and behavior
 * - Test component states (loading, error, success, etc.)
 * - Understand component usage patterns
 * - Validate design consistency
 */
export default function DemoPage() {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('layout');

  // State for interactive demos
  const [showError, setShowError] = useState(false);
  const [errorType, setErrorType] = useState<'generic' | 'network' | 'session-expired' | 'validation' | 'critical'>('generic');
  const [loadingSize, setLoadingSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [loadingVariant, setLoadingVariant] = useState<'spinner' | 'content' | 'messages'>('spinner');

  const sections = [
    { id: 'layout', label: 'Layout & Structure' },
    { id: 'feedback', label: 'Feedback & Status' },
    { id: 'content', label: 'Learning Content' },
    { id: 'dialogs', label: 'Chat & Messages' },
    { id: 'domain', label: 'Domain Features' },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{
      backgroundColor: colors.bgPrimary,
      minHeight: '100vh',
      color: colors.textPrimary
    }}>
      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Sidebar Navigation */}
        <nav style={{
          width: '240px',
          position: 'sticky',
          top: '80px',
          height: 'calc(100vh - 80px)',
          padding: spacing.lg,
          borderRight: `1px solid ${colors.border}`,
          overflowY: 'auto'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: spacing.lg,
            color: colors.textPrimary
          }}>
            Component Showroom
          </h2>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {sections.map(section => (
              <li key={section.id} style={{ marginBottom: spacing.sm }}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: spacing.sm,
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: activeSection === section.id ? colors.primary : 'transparent',
                    color: activeSection === section.id ? '#fff' : colors.textSecondary,
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeSection === section.id ? 600 : 400,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = colors.bgTertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== section.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
          <div style={{
            marginTop: spacing.xl,
            padding: spacing.md,
            backgroundColor: colors.bgSecondary,
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: colors.textSecondary
          }}>
            <strong style={{ display: 'block', marginBottom: spacing.xs, color: colors.textPrimary }}>
              About This Page
            </strong>
            This is an internal UI showroom for developers and designers to preview and test components.
          </div>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: spacing.xl,
          paddingTop: '100px'
        }}>
          {/* Page Header */}
          <header style={{ marginBottom: spacing['3xl'] }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: spacing.sm,
              color: colors.textPrimary
            }}>
              Component Demonstration
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: colors.textSecondary,
              maxWidth: '800px'
            }}>
              An interactive showcase of all reusable components in the adaptive-lms application.
              Each section demonstrates component appearance, behavior, and various states.
            </p>
          </header>

          {/* Section 1: Layout & Structure */}
          <section id="layout" style={{ marginBottom: spacing['3xl'] }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: spacing.md,
              color: colors.textPrimary,
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: spacing.sm
            }}>
              Layout & Structure
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
              Core layout components that provide the application structure and navigation.
            </p>

            {/* Navigation Component */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Navigation <code style={{ fontSize: '0.875rem', color: colors.textSecondary, backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>&lt;Navigation /&gt;</code>
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Main navigation bar with logo, page links, theme toggle, and session duration tracking.
                Features active state indicators and responsive design.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <p style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: spacing.md }}>
                  The Navigation component is displayed at the top of this page. It includes:
                </p>
                <ul style={{ marginTop: spacing.sm, color: colors.textSecondary, paddingLeft: spacing.xl }}>
                  <li>Logo and branding</li>
                  <li>Page navigation links (Home, Learn, Profile, Demo)</li>
                  <li>Theme toggle button (light/dark mode)</li>
                  <li>Active page indicator with visual highlighting</li>
                  <li>Session duration tracker (when in learning mode)</li>
                </ul>
              </div>
            </div>

            {/* Card Container Example */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Card Containers
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Standard card pattern used throughout the application for grouping related content.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: spacing.lg }}>
                <div style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: spacing.lg,
                  backgroundColor: colors.bgSecondary
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Basic Card
                  </h4>
                  <p style={{ color: colors.textSecondary }}>
                    Standard card with border and padding.
                  </p>
                </div>
                <div style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: spacing.lg,
                  backgroundColor: colors.bgSecondary,
                  boxShadow: colors.shadowCard
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Elevated Card
                  </h4>
                  <p style={{ color: colors.textSecondary }}>
                    Card with shadow for emphasis.
                  </p>
                </div>
                <div style={{
                  border: `2px solid ${colors.primary}`,
                  borderRadius: '12px',
                  padding: spacing.lg,
                  backgroundColor: colors.bgSecondary
                }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.primary }}>
                    Highlighted Card
                  </h4>
                  <p style={{ color: colors.textSecondary }}>
                    Card with primary border for emphasis.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Feedback & Status */}
          <section id="feedback" style={{ marginBottom: spacing['3xl'] }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: spacing.md,
              color: colors.textPrimary,
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: spacing.sm
            }}>
              Feedback & Status
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
              Components for displaying loading states, errors, and user feedback.
            </p>

            {/* Loading Component */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Loading <code style={{ fontSize: '0.875rem', color: colors.textSecondary, backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>&lt;Loading /&gt;</code>
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Versatile loading indicator with multiple variants (spinner, content skeleton, message skeleton)
                and sizes (small, medium, large). Can also be displayed in fullscreen mode.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ display: 'block', marginBottom: spacing.sm, color: colors.textPrimary, fontWeight: 600 }}>
                    Variant:
                  </label>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {(['spinner', 'content', 'messages'] as const).map(variant => (
                      <button
                        key={variant}
                        onClick={() => setLoadingVariant(variant)}
                        style={{
                          padding: `${spacing.sm} ${spacing.md}`,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          backgroundColor: loadingVariant === variant ? colors.primary : 'transparent',
                          color: loadingVariant === variant ? '#fff' : colors.textPrimary,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ display: 'block', marginBottom: spacing.sm, color: colors.textPrimary, fontWeight: 600 }}>
                    Size:
                  </label>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {(['small', 'medium', 'large'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => setLoadingSize(size)}
                        style={{
                          padding: `${spacing.sm} ${spacing.md}`,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          backgroundColor: loadingSize === size ? colors.primary : 'transparent',
                          color: loadingSize === size ? '#fff' : colors.textPrimary,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px dashed ${colors.border}`,
                  borderRadius: '6px',
                  backgroundColor: colors.bgPrimary
                }}>
                  <Loading variant={loadingVariant} size={loadingSize} />
                </div>
              </div>
            </div>

            {/* Skeleton Components */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Skeleton Loaders
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Placeholder components that mimic the layout of content while it loads,
                providing a better perceived performance.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: spacing.lg }}>
                <div style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: spacing.lg,
                  backgroundColor: colors.bgSecondary
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.md, color: colors.textPrimary }}>
                    ContentSkeleton
                  </h4>
                  <ContentSkeleton />
                </div>
                <div style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: spacing.lg,
                  backgroundColor: colors.bgSecondary
                }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.md, color: colors.textPrimary }}>
                    MessageSkeleton
                  </h4>
                  <MessageSkeleton />
                </div>
              </div>
            </div>

            {/* ErrorMessage Component */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                ErrorMessage <code style={{ fontSize: '0.875rem', color: colors.textSecondary, backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>&lt;ErrorMessage /&gt;</code>
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Specialized error display component with different error types, recovery actions, and retry functionality.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <div style={{ marginBottom: spacing.lg }}>
                  <label style={{ display: 'block', marginBottom: spacing.sm, color: colors.textPrimary, fontWeight: 600 }}>
                    Error Type:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm }}>
                    {(['generic', 'network', 'session-expired', 'validation', 'critical'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setErrorType(type);
                          setShowError(true);
                        }}
                        style={{
                          padding: `${spacing.sm} ${spacing.md}`,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '6px',
                          backgroundColor: errorType === type && showError ? colors.error : 'transparent',
                          color: errorType === type && showError ? '#fff' : colors.textPrimary,
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {showError && (
                  <ErrorMessage
                    type={errorType}
                    message={`This is a sample ${errorType} error message for demonstration purposes.`}
                    onDismiss={() => setShowError(false)}
                    onRetry={() => {
                      setShowError(false);
                      setTimeout(() => setShowError(true), 500);
                    }}
                  />
                )}
                {!showError && (
                  <div style={{
                    padding: spacing.lg,
                    border: `1px dashed ${colors.border}`,
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: colors.textSecondary,
                    backgroundColor: colors.bgPrimary
                  }}>
                    Select an error type above to preview
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Learning Content */}
          <section id="content" style={{ marginBottom: spacing['3xl'] }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: spacing.md,
              color: colors.textPrimary,
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: spacing.sm
            }}>
              Learning Content
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
              Specialized components for displaying educational content including lessons, exercises, and quizzes.
            </p>

            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: spacing.lg,
              backgroundColor: colors.bgSecondary
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: spacing.md, color: colors.textPrimary }}>
                Content Components
              </h3>
              <ul style={{ color: colors.textSecondary, paddingLeft: spacing.xl, lineHeight: 1.8 }}>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>LessonViewer</code> - Displays educational lesson content with multiple formats (text, visual, video, interactive)</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>ExerciseCard</code> - Interactive exercise component with answer input, hint panel, and explanation display</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>QuizCard</code> - Quiz component with multiple choice, true/false, and multiple select options</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>HintPanel</code> - Collapsible panel showing progressive hints in accordion format</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>ExplanationPanel</code> - Displays detailed explanations after answer submission</li>
              </ul>
              <p style={{ color: colors.textSecondary, marginTop: spacing.lg, fontStyle: 'italic' }}>
                Visit <strong>/learn</strong> to see these components in action within a full learning session.
              </p>
            </div>
          </section>

          {/* Section 4: Chat & Messages */}
          <section id="dialogs" style={{ marginBottom: spacing['3xl'] }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: spacing.md,
              color: colors.textPrimary,
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: spacing.sm
            }}>
              Chat & Messages
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
              Components for building interactive chat interfaces and displaying conversation messages.
            </p>

            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: spacing.lg,
              backgroundColor: colors.bgSecondary
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: spacing.md, color: colors.textPrimary }}>
                Dialog Components
              </h3>
              <ul style={{ color: colors.textSecondary, paddingLeft: spacing.xl, lineHeight: 1.8 }}>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>ChatInterface</code> - Complete chat UI composition with message fetching and sending</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>DialogHeader</code> - Session information display with topic, type badge, and controls</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>MessageList</code> - Scrollable message list with auto-scroll functionality</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>MessageBubble</code> - Individual message display with timestamps and styling</li>
                <li><code style={{ backgroundColor: colors.bgCodeInline, padding: '2px 6px', borderRadius: '4px' }}>InputArea</code> - Message input with auto-resizing textarea and keyboard shortcuts</li>
              </ul>
              <p style={{ color: colors.textSecondary, marginTop: spacing.lg, fontStyle: 'italic' }}>
                Visit <strong>/learn</strong> to interact with the full chat interface in a learning session.
              </p>
            </div>
          </section>

          {/* Section 5: Domain Features */}
          <section id="domain" style={{ marginBottom: spacing['3xl'] }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: spacing.md,
              color: colors.textPrimary,
              borderBottom: `2px solid ${colors.border}`,
              paddingBottom: spacing.sm
            }}>
              Domain Features
            </h2>
            <p style={{ color: colors.textSecondary, marginBottom: spacing.xl }}>
              Application-specific patterns and composed features demonstrating how components work together.
            </p>

            {/* Badges and Tags */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Badges & Tags
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Visual indicators used throughout the application for topics, difficulty levels, and status.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <div style={{ marginBottom: spacing.lg }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Difficulty Badges
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {[
                      { level: 'beginner', color: colors.success },
                      { level: 'intermediate', color: colors.warning },
                      { level: 'advanced', color: colors.error }
                    ].map(({ level, color }) => (
                      <span
                        key={level}
                        style={{
                          display: 'inline-block',
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: `${color}20`,
                          color: color,
                          border: `1px solid ${color}40`,
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: spacing.lg }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Topic Tags
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {['React', 'TypeScript', 'Hooks', 'State Management', 'Components'].map(topic => (
                      <span
                        key={topic}
                        style={{
                          display: 'inline-block',
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: colors.bgTertiary,
                          color: colors.textPrimary,
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          border: `1px solid ${colors.border}`
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Status Indicators
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    {[
                      { status: 'Active', color: colors.success },
                      { status: 'Completed', color: colors.primary },
                      { status: 'In Progress', color: colors.warning },
                      { status: 'Locked', color: colors.bgDisabled }
                    ].map(({ status, color }) => (
                      <span
                        key={status}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: spacing.xs,
                          padding: `${spacing.xs} ${spacing.sm}`,
                          backgroundColor: `${color}20`,
                          color: color,
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: color
                          }}
                        />
                        {status}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Button Styles */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Button Patterns
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Common button styles used throughout the application for various actions.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <div style={{ marginBottom: spacing.lg }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Primary Actions
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: colors.primary,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: colors.success,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Success Button
                    </button>
                    <button
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: colors.error,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Danger Button
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: spacing.lg }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Secondary Actions
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    <button
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: 'transparent',
                        color: colors.primary,
                        border: `2px solid ${colors.primary}`,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Secondary Button
                    </button>
                    <button
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: colors.bgTertiary,
                        color: colors.textPrimary,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Neutral Button
                    </button>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                    Disabled States
                  </h4>
                  <div style={{ display: 'flex', gap: spacing.sm, flexWrap: 'wrap' }}>
                    <button
                      disabled
                      style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        backgroundColor: colors.bgDisabled,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        cursor: 'not-allowed',
                        opacity: 0.6
                      }}
                    >
                      Disabled Button
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Samples */}
            <div style={{ marginBottom: spacing.xl }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                Typography Scale
              </h3>
              <p style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
                Standardized text styles used throughout the application.
              </p>
              <div style={{
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                padding: spacing.lg,
                backgroundColor: colors.bgSecondary
              }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: spacing.sm, color: colors.textPrimary }}>
                  Heading 1 - 2.5rem / 700
                </h1>
                <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                  Heading 2 - 2rem / 600
                </h2>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                  Heading 3 - 1.5rem / 600
                </h3>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: spacing.sm, color: colors.textPrimary }}>
                  Heading 4 - 1.25rem / 600
                </h4>
                <p style={{ fontSize: '1rem', marginBottom: spacing.sm, color: colors.textPrimary }}>
                  Body text - 1rem - This is the standard body text size used for most content. It provides good readability and is the default for paragraphs and most UI text.
                </p>
                <p style={{ fontSize: '0.875rem', marginBottom: spacing.sm, color: colors.textSecondary }}>
                  Small text - 0.875rem - Used for captions, labels, helper text, and secondary information that should be less prominent than body text.
                </p>
                <p style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                  Tiny text - 0.75rem - Used for timestamps, minimal UI elements, and fine print that needs to be readable but not attention-grabbing.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{
            marginTop: spacing['3xl'],
            paddingTop: spacing.xl,
            borderTop: `1px solid ${colors.border}`,
            textAlign: 'center',
            color: colors.textSecondary
          }}>
            <p style={{ marginBottom: spacing.sm }}>
              Component Demonstration Page - Adaptive LMS
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              This page showcases all reusable components for internal development and design reference.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
