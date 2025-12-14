# Frontend Component Style Guide

This document defines the design system and styling patterns used in the Adaptive LMS frontend application.

## Design System v2.0 - Modern Education-Focused Theme

### Theme System
The design system supports both light and dark themes through a ThemeContext. Colors, shadows, and backgrounds automatically adapt based on the selected theme.

**Theme Management:**
- Located in: `src/contexts/ThemeContext.tsx`
- Design tokens: `src/styles/designTokens.ts`
- Theme persists to localStorage
- Toggle via Navigation component

### Color Palette

#### Light Theme Primary Colors
- **Primary Indigo** (Educational): `#4f46e5` (buttons, links, accents)
  - Hover: `#4338ca`
  - Light: `rgba(79, 70, 229, 0.1)`
  - Border: `rgba(79, 70, 229, 0.3)`
- **Accent Amber** (Engagement): `#f59e0b`
  - Hover: `#d97706`
  - Light: `rgba(245, 158, 11, 0.1)`
- **Success Green**: `#10b981`
  - Hover: `#059669`
  - Dark: `#047857`
  - Light: `rgba(16, 185, 129, 0.1)`
  - Border: `rgba(16, 185, 129, 0.3)`
- **Error Red**: `#ef4444`
  - Hover: `#dc2626`
  - Light: `rgba(239, 68, 68, 0.15)`
  - Border: `rgba(239, 68, 68, 0.4)`
- **Warning Amber**: `#f59e0b`
  - Hover: `#d97706`
  - Light: `rgba(245, 158, 11, 0.1)`
- **Info Blue**: `#3b82f6`
  - Hover: `#2563eb`
  - Light: `rgba(59, 130, 246, 0.1)`
- **Purple**: `#8b5cf6`
  - Hover: `#7c3aed`
  - Light: `rgba(139, 92, 246, 0.1)`

#### Dark Theme Primary Colors
- **Primary Indigo**: `#6366f1`
  - Hover: `#818cf8`
  - Light: `rgba(99, 102, 241, 0.15)`
  - Border: `rgba(99, 102, 241, 0.3)`
- **Accent Amber**: `#fbbf24`
  - Hover: `#f59e0b`
  - Light: `rgba(251, 191, 36, 0.15)`
- **Success Green**: `#34d399`
  - Hover: `#10b981`
  - Dark: `#059669`
  - Light: `rgba(52, 211, 153, 0.15)`
  - Border: `rgba(52, 211, 153, 0.3)`
- **Error Red**: `#f87171`
  - Hover: `#ef4444`
  - Light: `rgba(248, 113, 113, 0.15)`
  - Border: `rgba(248, 113, 113, 0.3)`

#### Light Theme Neutral Colors
- **Text Primary**: `#1f2937`
- **Text Secondary**: `#4b5563`
- **Text Muted**: `#6b7280`
- **Text Label**: `#374151`
- **Background Primary**: `#ffffff`
- **Background Secondary**: `#f9fafb`
- **Background Tertiary**: `#f3f4f6`
- **Border**: `rgba(0, 0, 0, 0.08)`
- **Border Medium**: `rgba(0, 0, 0, 0.12)`
- **Border Input**: `rgba(0, 0, 0, 0.15)`

#### Dark Theme Neutral Colors
- **Text Primary**: `#f9fafb`
- **Text Secondary**: `#e5e7eb`
- **Text Muted**: `#9ca3af`
- **Text Label**: `#d1d5db`
- **Background Primary**: `#111827`
- **Background Secondary**: `#1f2937`
- **Background Tertiary**: `#374151`
- **Border**: `rgba(255, 255, 255, 0.08)`
- **Border Medium**: `rgba(255, 255, 255, 0.12)`
- **Border Input**: `rgba(255, 255, 255, 0.15)`

#### Shadow System (Light Theme)
- **Shadow SM**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **Shadow MD**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **Shadow LG**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **Shadow XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
- **Shadow Card**: `0 2px 8px rgba(0, 0, 0, 0.08)`
- **Shadow Card Hover**: `0 8px 16px rgba(0, 0, 0, 0.12)`

#### Shadow System (Dark Theme)
- **Shadow SM**: `0 1px 2px 0 rgba(0, 0, 0, 0.3)`
- **Shadow MD**: `0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)`
- **Shadow LG**: `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)`
- **Shadow XL**: `0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5)`
- **Shadow Card**: `0 2px 8px rgba(0, 0, 0, 0.3)`
- **Shadow Card Hover**: `0 8px 16px rgba(0, 0, 0, 0.4)`

#### Gradient Backgrounds
- **Primary Gradient**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Subtle Gradient** (Light): `linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)`
- **Subtle Gradient** (Dark): `linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%)`

#### JSON Syntax Highlighting
- **Property Keys**: `#0066cc` (weight: 600)
- **String Values**: `#22863a`
- **Numbers**: `#d97706`
- **Booleans/Null**: `#6f42c1`

### Typography

#### Font Families
- **Body**: `system-ui, -apple-system, sans-serif`
- **Monospace**: `ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace`

#### Font Sizes
- **H1**: `2rem` (32px)
- **H2**: `1.5rem` (24px)
- **H3**: `1.25rem` (20px) or `1.1rem` (17.6px) for subsections
- **Body**: `1rem` (16px)
- **Small**: `0.95rem` (15.2px)
- **Tiny**: `0.875rem` (14px)
- **Code**: `0.9rem` (14.4px)

#### Font Weights
- **Bold Headings**: `700`
- **Semibold**: `600`
- **Medium**: `500`
- **Normal**: `400`

#### Line Heights
- **Body Text**: `1.6`
- **Lists**: `1.8`

### Spacing

#### Padding
- **Container**: `2rem`
- **Panel Large**: `1.25rem`
- **Panel Medium**: `1rem`
- **Button**: `0.75rem 1.5rem`
- **Input**: `0.5rem`
- **Inline Code**: `0.15rem 0.4rem`
- **Code Block**: `0.25rem 0.5rem`

#### Margins
- **Section Bottom**: `2rem`
- **Element Bottom**: `1.5rem`
- **Heading Bottom**: `1rem` or `0.5rem`

#### Gaps
- **Button Group**: `0.75rem`
- **Grid**: `1rem`

### Border Radius
- **Modern Cards**: `16px` (increased for softer look)
- **Buttons**: `10px` (rounded)
- **Icon Badges**: `12px`
- **Panels**: `8px`
- **Inputs**: `6px`
- **Code Inline**: `4px`
- **Code Block**: `6px`

### Animations & Transitions
- **Standard Transition**: `all 0.2s` or `all 0.2s ease`
- **Smooth Transition**: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- **Hover Transform**: `translateY(-4px)` for cards
- **Scale Transform**: `scale(1.02)` for buttons

### Layout

#### Container
```css
{
  padding: '2rem',
  maxWidth: '900px',
  margin: '0 auto',
  minHeight: '100vh',
  fontFamily: 'system-ui, -apple-system, sans-serif'
}
```

#### Responsive Grid
```css
{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem'
}
```

#### Flex Layout (Buttons)
```css
{
  display: 'flex',
  gap: '0.75rem',
  flexWrap: 'wrap'
}
```

## Modern Component Patterns (v2.0)

### Using Theme Context

All modern components should use the `useTheme()` hook to access theme-aware colors:

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, colors, toggleTheme } = useTheme();

  // Use colors.primary, colors.textPrimary, etc.
  // These automatically adapt to light/dark theme
}
```

### Modern Card with Elevation

```tsx
const modernCardStyle: CSSProperties = {
  padding: spacing['2xl'],
  backgroundColor: colors.bgSecondary,
  border: `1px solid ${colors.border}`,
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
};

const handleCardHover = (e: React.MouseEvent<HTMLDivElement>, enter: boolean) => {
  const target = e.currentTarget;
  if (enter) {
    target.style.transform = 'translateY(-4px)';
    target.style.boxShadow = colors.shadowCardHover;
    target.style.borderColor = colors.primaryBorder;
  } else {
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = colors.shadowCard;
    target.style.borderColor = colors.border;
  }
};

<div
  style={modernCardStyle}
  onMouseEnter={(e) => handleCardHover(e, true)}
  onMouseLeave={(e) => handleCardHover(e, false)}
>
  {/* Card content */}
</div>
```

### Icon Badge

```tsx
const iconBadgeStyle: CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  marginBottom: spacing.lg,
  background: colors.primaryLight,
  color: colors.primary,
};

<div style={iconBadgeStyle}>🎓</div>
<div style={{ ...iconBadgeStyle, background: colors.successLight, color: colors.success }}>📊</div>
<div style={{ ...iconBadgeStyle, background: colors.purpleLight, color: colors.purple }}>⚡</div>
```

### Gradient Title

```tsx
const titleGradientStyle: CSSProperties = {
  fontSize: '3rem',
  fontWeight: fontWeight.bold,
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #f59e0b 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: spacing.lg,
  letterSpacing: '-0.02em',
};

<h1 style={titleGradientStyle}>Adaptive Learning Management System</h1>
```

### Modern Navigation with Theme Toggle

```tsx
const { theme, colors, toggleTheme } = useTheme();

const navStyle: CSSProperties = {
  backgroundColor: colors.bgSecondary,
  padding: `${spacing.lg} 0`,
  marginBottom: spacing['3xl'],
  boxShadow: colors.shadowMd,
  borderBottom: `1px solid ${colors.border}`,
};

const themeToggleStyle: CSSProperties = {
  background: colors.bgTertiary,
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  padding: `${spacing.sm} ${spacing.md}`,
  cursor: 'pointer',
  fontSize: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  marginLeft: spacing.md,
};

<button
  onClick={toggleTheme}
  style={themeToggleStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = colors.shadowSm;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  aria-label="Toggle theme"
>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

### Gradient Background Section

```tsx
const featuresStyle: CSSProperties = {
  padding: spacing['2xl'],
  background: colors.bgGradientSubtle,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
};

<section style={featuresStyle}>
  <h3>✨ Features</h3>
  {/* Content */}
</section>
```

## Legacy Component Patterns (v1.0)

### Page Header
```tsx
<div style={{ marginBottom: '2rem' }}>
  <h1 style={{
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#213547'
  }}>
    Page Title
  </h1>
  <p style={{
    fontSize: '1rem',
    color: '#646cff',
    margin: 0
  }}>
    Page description or subtitle
  </p>
</div>
```

### Configuration Panel
```tsx
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
    ⚙️ Configuration
  </h3>
  {/* Form content */}
</div>
```

### Form Input
```tsx
<div>
  <label style={{
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.375rem',
    color: '#374151'
  }}>
    Label Text
  </label>
  <input
    type="text"
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
```

### Primary Button
```tsx
<button
  onClick={handleClick}
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
    opacity: loading ? 0.6 : 1,
  }}
  onMouseEnter={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = '#535bf2';
  }}
  onMouseLeave={(e) => {
    if (!loading) e.currentTarget.style.backgroundColor = '#646cff';
  }}
>
  Button Text
</button>
```

### Button Color Variants
- **Primary Action** (Create, Submit): `#646cff` → `#535bf2`
- **Success Action** (Create Dialog): `#22c55e` → `#16a34a`
- **Info Action** (Send, Update): `#3b82f6` → `#2563eb`
- **Warning Action** (Test Error): `#f59e0b` → `#d97706`
- **Danger Action** (Delete, End): `#ef4444` → `#dc2626`

### Loading Indicator
```tsx
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
```

### Error Display
```tsx
{error && (
  <div
    style={{
      padding: '1.25rem',
      backgroundColor: 'rgba(220, 38, 38, 0.15)',
      border: '1px solid rgba(220, 38, 38, 0.4)',
      borderLeft: '4px solid #dc2626',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    }}
  >
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
      {/* Additional error details */}
    </div>
  </div>
)}
```

### Success Display
```tsx
{result && !error && (
  <div
    style={{
      padding: '1.25rem',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      borderLeft: '4px solid #22c55e',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    }}
  >
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
      whiteSpace: 'pre',
    }}>
      {formatJSON(result)}
    </pre>
  </div>
)}
```

### Instructions Panel
```tsx
<div style={{
  padding: '1.25rem',
  backgroundColor: 'rgba(249, 250, 251, 0.8)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '8px'
}}>
  <h3 style={{
    margin: '0 0 1rem 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#213547'
  }}>
    📋 Instructions
  </h3>
  <ol style={{
    margin: '0',
    paddingLeft: '1.5rem',
    color: '#213547',
    fontSize: '0.95rem',
    lineHeight: '1.8'
  }}>
    <li>Instruction item with <code style={{
      padding: '0.15rem 0.4rem',
      backgroundColor: 'rgba(100, 108, 255, 0.1)',
      borderRadius: '4px',
      fontSize: '0.9rem'
    }}>inline code</code></li>
    <li>Another instruction with <kbd style={{
      padding: '0.15rem 0.4rem',
      backgroundColor: '#213547',
      color: 'white',
      borderRadius: '4px',
      fontSize: '0.85rem'
    }}>keyboard shortcut</kbd></li>
  </ol>
</div>
```

## JSON Formatting Utility

### formatJSON Function
Include this utility function for syntax-highlighted JSON display:

```tsx
const formatJSON = (data: any): React.ReactElement => {
  const jsonString = JSON.stringify(data, null, 2);

  const highlighted = jsonString.split('\n').map((line, lineIndex) => {
    const parts: React.ReactNode[] = [];
    const keyRegex = /"([^"]+)":/g;

    // Process line through marker system
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

    // Split and render with appropriate colors
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
```

## State Management Pattern

### Test Component State Structure
```tsx
const [loading, setLoading] = useState<boolean>(false);
const [result, setResult] = useState<any>(null);
const [error, setError] = useState<ApiError | null>(null);

// Generic test execution wrapper
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
```

## Best Practices

### DO:
- ✅ Use inline styles with the design system values
- ✅ Include emoji in section headings (⚙️, 📋, ✅, ❌, ⏳)
- ✅ Implement hover states for interactive elements
- ✅ Show loading states during async operations
- ✅ Display both success and error states clearly
- ✅ Use semantic HTML (button, label, input, etc.)
- ✅ Add console logging for debugging
- ✅ Make layouts responsive with flexbox/grid
- ✅ Use consistent spacing throughout
- ✅ Include clear instructions for users

### DON'T:
- ❌ Mix different color schemes
- ❌ Use arbitrary spacing values
- ❌ Ignore disabled/loading states
- ❌ Skip hover effects on buttons
- ❌ Forget to handle errors
- ❌ Use inline styles for CSS classes
- ❌ Hardcode magic numbers
- ❌ Ignore accessibility (use semantic HTML)
- ❌ Skip console logging for important events

## Component File Structure

```tsx
import { useState } from 'react';
import { serviceFunction } from '../services/someService';
import type { SomeType } from '../types/someType';
import type { ApiError } from '../types/api';

/**
 * Component documentation
 */

// Utility functions (like formatJSON)
const utilityFunction = () => { ... };

export default function ComponentName() {
  // State declarations
  const [state, setState] = useState();

  // Event handlers
  const handleAction = async () => { ... };

  // Render
  return (
    <div style={{ /* container styles */ }}>
      {/* Component JSX */}
    </div>
  );
}
```

## References

### Example Components
- `frontend/src/components/ApiTest.tsx` - Reference implementation
- `frontend/src/components/DialogServiceTest.tsx` - Dialog service test with full styling

### Type Definitions
- `frontend/src/types/api.ts` - ApiError interface
- Component-specific types from `frontend/src/types/`

---

## Design System Changelog

### v2.0 (2024-12-04) - Modern Education-Focused Theme
**Major Updates:**
- ✨ Added comprehensive dark mode support with ThemeContext
- 🎨 New education-focused color palette (Indigo primary, Amber accent)
- 🌓 Light and dark theme with 50+ color tokens each
- 💫 Modern shadow system with elevation levels
- 🎯 Gradient backgrounds and text effects
- 📦 Increased border radius for modern card designs (16px)
- ⚡ Smooth animations with cubic-bezier easing
- 🏗️ Theme-aware components using useTheme() hook
- 📱 Modern card components with hover elevation
- 🎨 Icon badge components with colored backgrounds
- 🌈 Gradient title support
- 🔄 Theme toggle button in navigation

**New Components:**
- ThemeContext (`src/contexts/ThemeContext.tsx`)
- Enhanced Navigation with theme toggle
- Modern card patterns with elevation
- Icon badge components
- Gradient text headings

**Updated Files:**
- `src/styles/designTokens.ts` - Added lightColors and darkColors
- `src/index.css` - Added dark theme CSS variables
- `src/pages/HomePage.tsx` - Updated with modern card designs
- `src/components/Navigation.tsx` - Added theme toggle button
- `src/main.tsx` - Wrapped app in ThemeProvider

**Breaking Changes:**
- Color imports should now use `useTheme()` hook instead of direct imports for theme support
- Components should use `colors` from useTheme() for theme-aware styling

**Migration Guide:**
```tsx
// Old (v1.0)
import { colors } from '../styles/designTokens';
const style = { color: colors.primary };

// New (v2.0)
import { useTheme } from '../contexts/ThemeContext';
const { colors } = useTheme();
const style = { color: colors.primary }; // Now theme-aware!
```

### v1.0 (2024-12-03) - Initial Design System
- Initial color palette
- Typography system
- Spacing scale
- Component patterns
- JSON formatting utility

---

**Last Updated**: 2024-12-04
**Version**: 2.0.0
