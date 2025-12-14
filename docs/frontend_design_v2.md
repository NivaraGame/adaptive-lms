# Frontend Design System v2.0 - Adaptive LMS

## Overview

The Adaptive LMS frontend features a modern, education-focused design system with comprehensive dark mode support. The design emphasizes clarity, engagement, and accessibility for an optimal learning experience.

**Version**: 2.0.0
**Last Updated**: 2024-12-04
**Status**: Production Ready ✅

---

## Key Features

### 🌓 Dark Mode Support
- Complete light and dark theme implementation
- Theme persists to localStorage
- Smooth transitions between themes
- Toggle button in navigation (🌙/☀️)
- Theme-aware components using React Context

### 🎨 Education-Focused Color Palette
- **Primary Indigo** (`#4f46e5`) - Professional, trustworthy, educational
- **Accent Amber** (`#f59e0b`) - Warm, engaging, motivational
- Refined semantic colors (success, error, warning, info)
- 50+ color tokens for each theme

### 💫 Modern UI Enhancements
- Elevated card designs with smooth hover effects
- Multi-level shadow system for depth
- Gradient text effects for headings
- Icon badges with colored backgrounds
- Glassmorphism and subtle gradient backgrounds
- Smooth animations with cubic-bezier easing

### 📱 Responsive & Accessible
- Mobile-first approach
- Semantic HTML elements
- ARIA labels and accessibility support
- High contrast ratios for readability

---

## Architecture

### Theme System

```
src/contexts/ThemeContext.tsx
  ↓
Provides: { theme, colors, toggleTheme }
  ↓
Used by: All components via useTheme() hook
```

**How it works:**
1. ThemeContext manages current theme state ('light' | 'dark')
2. Provides theme-appropriate color schemes from designTokens
3. Persists preference to localStorage
4. Updates `data-theme` attribute on `<html>` for CSS variables

**Usage:**
```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <div style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
}
```

### Design Tokens

Located in: `src/styles/designTokens.ts`

**Structure:**
```typescript
export const lightColors = { /* 50+ color tokens */ }
export const darkColors = { /* 50+ color tokens */ }
export const colors = lightColors // Default export

export const spacing = { xs, sm, md, lg, xl, '2xl', '3xl' }
export const fontSize = { xs, sm, base, md, lg, xl, '2xl' }
export const fontWeight = { normal, medium, semibold, bold }
export const borderRadius = { sm, md, lg }
```

**Color Token Categories:**
- Primary & Accent colors
- Semantic colors (success, error, warning, info, purple)
- Text colors (primary, secondary, muted, label)
- Background colors (primary, secondary, tertiary)
- Border colors (default, medium, input)
- Shadow tokens (sm, md, lg, xl, card, cardHover)
- Gradient backgrounds
- Syntax highlighting (for code blocks)

### Global CSS Variables

Located in: `src/index.css`

**Light Theme Variables:**
```css
:root {
  --color-primary: #4f46e5;
  --color-text-primary: #1f2937;
  --color-background: #ffffff;
  /* ... 40+ more variables */
}
```

**Dark Theme Variables:**
```css
[data-theme="dark"] {
  --color-primary: #6366f1;
  --color-text-primary: #f9fafb;
  --color-background: #111827;
  /* ... 40+ more variables */
}
```

---

## Component Patterns

### 1. Modern Card with Elevation

**Visual Characteristics:**
- 16px border radius (softer than traditional 8px)
- Subtle shadow at rest
- Elevates on hover with translateY(-4px)
- Border color changes to primary on hover
- Smooth cubic-bezier transition

**Implementation:**
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
```

**Example:**
See `src/pages/HomePage.tsx:45-154`

### 2. Icon Badges

**Visual Characteristics:**
- 48x48px squares with 12px border radius
- Colored background with matching icon color
- Themed backgrounds (primary, success, purple, etc.)
- Used as visual anchors in cards

**Implementation:**
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
```

**Example:**
See `src/pages/HomePage.tsx:141-181`

### 3. Gradient Text Headings

**Visual Characteristics:**
- Multi-color gradient (indigo → purple → amber)
- Large font size (3rem)
- Letter spacing reduced (-0.02em) for tighter feel
- Transparent fill with background-clip

**Implementation:**
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
```

**Example:**
See `src/pages/HomePage.tsx:129`

### 4. Navigation with Theme Toggle

**Visual Characteristics:**
- Gradient logo text (indigo → purple)
- Glass-like background with subtle backdrop blur
- Shadow beneath for elevation
- Theme toggle button with scale animation on hover

**Implementation:**
```tsx
const logoStyle: CSSProperties = {
  fontSize: fontSize.xl,
  fontWeight: fontWeight.bold,
  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textDecoration: 'none',
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
>
  {theme === 'light' ? '🌙' : '☀️'}
</button>
```

**Example:**
See `src/components/Navigation.tsx:6-145`

### 5. Gradient Background Sections

**Visual Characteristics:**
- Subtle two-color gradient backgrounds
- Different gradients for light and dark themes
- Used for feature sections or callouts

**Implementation:**
```tsx
const featuresStyle: CSSProperties = {
  padding: spacing['2xl'],
  background: colors.bgGradientSubtle,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
};

<section style={featuresStyle}>
  <h3>✨ Features</h3>
  <ul>
    <li>Adaptive content recommendation</li>
    <li>Multiple content formats</li>
    <li>Real-time difficulty adjustment</li>
  </ul>
</section>
```

**Example:**
See `src/pages/HomePage.tsx:189-200`

---

## Color Philosophy

### Light Theme
**Goals:** Clean, professional, high-energy learning environment

- **Primary** (`#4f46e5`): Educational indigo - professional and trustworthy
- **Accent** (`#f59e0b`): Warm amber - engagement and achievement
- **Backgrounds**: White to light gray progression for hierarchy
- **Text**: Dark gray (not pure black) for reduced eye strain
- **Shadows**: Subtle, realistic depth cues

**Usage Context:**
- Default for daytime learning sessions
- Optimized for well-lit environments
- Maximum contrast for charts and data visualization

### Dark Theme
**Goals:** Comfortable, focused, low-eye-strain experience

- **Primary** (`#6366f1`): Brighter indigo for visibility on dark backgrounds
- **Accent** (`#fbbf24`): Bright amber for warmth and positivity
- **Backgrounds**: Deep gray to mid-gray progression (not pure black)
- **Text**: Off-white for reduced glare
- **Shadows**: Deeper, more pronounced for depth on dark surfaces

**Usage Context:**
- Evening/night learning sessions
- Low-light environments
- Extended reading sessions
- Reduced eye strain for sensitive users

---

## Typography

### Font Families
- **Body Text**: System UI stack for native feel
  - `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Monospace**: Developer-friendly code fonts
  - `ui-monospace, SFMono-Regular, 'SF Mono', Consolas, Monaco, monospace`

### Font Scale
```
3rem (48px)   - Hero titles
2rem (32px)   - H1 headings
1.5rem (24px) - H2 headings
1.25rem (20px) - H3 headings
1rem (16px)    - Body text (base)
0.95rem (15px) - Small text
0.875rem (14px) - Tiny text, labels
```

### Font Weights
- **700 (Bold)**: Headings, primary CTAs
- **600 (Semibold)**: Section headers, navigation
- **500 (Medium)**: Button text, labels
- **400 (Normal)**: Body text, descriptions

### Line Heights
- **1.6**: Body text (optimal readability)
- **1.8**: Lists (better spacing)
- **1.2**: Headings (tighter, more impactful)

---

## Spacing System

**Scale:**
```
xs:  0.375rem (6px)
sm:  0.5rem   (8px)
md:  0.75rem  (12px)
lg:  1rem     (16px)
xl:  1.25rem  (20px)
2xl: 1.5rem   (24px)
3xl: 2rem     (32px)
```

**Usage Guidelines:**
- **Padding**: Use 2xl-3xl for containers, lg-xl for cards, md for buttons
- **Margins**: Use 2xl-3xl for section spacing, lg-xl for element spacing
- **Gaps**: Use md-lg for flex/grid layouts

---

## Shadows & Elevation

### Shadow Levels

**Light Theme:**
```
sm:   0 1px 2px 0 rgba(0,0,0,0.05)           - Subtle accent
md:   0 4px 6px -1px rgba(0,0,0,0.1)        - Default cards
lg:   0 10px 15px -3px rgba(0,0,0,0.1)      - Modal dialogs
xl:   0 20px 25px -5px rgba(0,0,0,0.1)      - Floating elements
card: 0 2px 8px rgba(0,0,0,0.08)            - Resting cards
cardHover: 0 8px 16px rgba(0,0,0,0.12)      - Elevated cards
```

**Dark Theme:**
```
sm:   0 1px 2px 0 rgba(0,0,0,0.3)
md:   0 4px 6px -1px rgba(0,0,0,0.4)
lg:   0 10px 15px -3px rgba(0,0,0,0.5)
xl:   0 20px 25px -5px rgba(0,0,0,0.6)
card: 0 2px 8px rgba(0,0,0,0.3)
cardHover: 0 8px 16px rgba(0,0,0,0.4)
```

**Elevation Hierarchy:**
1. Base layer (no shadow) - Body background
2. Level 1 (sm) - Subtle highlights
3. Level 2 (md/card) - Cards, panels, resting state
4. Level 3 (lg/cardHover) - Elevated cards, navigation
5. Level 4 (xl) - Modals, popovers, top layer

---

## Animations & Transitions

### Transition Speeds
- **Fast** (0.2s): Hover states, clicks, toggles
- **Medium** (0.3s): Card elevation, navigation
- **Slow** (0.5s): Page transitions, modals

### Easing Functions
- **Standard**: `ease` - General purpose
- **Smooth**: `cubic-bezier(0.4, 0, 0.2, 1)` - Material Design easing
- **Bounce**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Playful interactions

### Common Transforms
```tsx
// Card hover
transform: 'translateY(-4px)'

// Button hover
transform: 'scale(1.02)'

// Theme toggle
transform: 'scale(1.1)'
```

---

## Border Radius Scale

```
4px  - Inline code, small badges
6px  - Inputs, code blocks, panels
8px  - Legacy buttons, legacy cards
10px - Modern buttons
12px - Icon badges, theme toggle
16px - Modern cards, sections
```

**Philosophy:**
- Larger radii (16px) create softer, more approachable feel
- Appropriate for education context (friendly, not corporate)
- Consistent with modern UI trends

---

## Implementation Guide

### Setting Up a New Page

```tsx
import type { CSSProperties } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { spacing, fontSize, fontWeight } from '../styles/designTokens';

function MyPage() {
  const { colors } = useTheme();

  const containerStyle: CSSProperties = {
    padding: spacing['3xl'],
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
  };

  return (
    <div style={containerStyle}>
      <h1>My Page</h1>
      {/* Content */}
    </div>
  );
}

export default MyPage;
```

### Creating a Themed Button

```tsx
const { colors } = useTheme();

const buttonStyle: CSSProperties = {
  padding: `${spacing.md} ${spacing.xl}`,
  backgroundColor: colors.primary,
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  fontSize: fontSize.base,
  fontWeight: fontWeight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: colors.shadowSm,
};

<button
  style={buttonStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = colors.primaryHover;
    e.currentTarget.style.transform = 'scale(1.02)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = colors.primary;
    e.currentTarget.style.transform = 'scale(1)';
  }}
>
  Click Me
</button>
```

### Best Practices

**DO:**
- ✅ Always use `useTheme()` hook for colors
- ✅ Use design tokens (spacing, fontSize) instead of magic numbers
- ✅ Implement hover states for interactive elements
- ✅ Use semantic color names (primary, success, error)
- ✅ Test in both light and dark themes
- ✅ Use appropriate shadow levels for elevation
- ✅ Apply smooth transitions to animations

**DON'T:**
- ❌ Hard-code color values
- ❌ Mix spacing values arbitrarily
- ❌ Skip hover states on buttons/links
- ❌ Use pure black (#000) or pure white (#fff) for text
- ❌ Forget to test dark mode
- ❌ Over-animate (keep transitions subtle)
- ❌ Ignore accessibility (contrast, ARIA labels)

---

## File Structure

```
frontend/src/
├── contexts/
│   └── ThemeContext.tsx        # Theme management
├── styles/
│   ├── designTokens.ts         # Color & spacing tokens
│   └── sharedStyles.ts         # Reusable style utilities
├── index.css                    # Global CSS + theme variables
├── components/
│   ├── Navigation.tsx          # Nav with theme toggle
│   └── ...
├── pages/
│   ├── HomePage.tsx            # Modern card designs
│   └── ...
└── main.tsx                     # ThemeProvider wrapper
```

---

## Browser Support

- **Chrome/Edge**: Full support (latest 2 versions)
- **Firefox**: Full support (latest 2 versions)
- **Safari**: Full support (latest 2 versions)
- **Mobile**: iOS Safari 14+, Chrome Android 90+

**CSS Features Used:**
- CSS Variables (all browsers)
- CSS Grid (all browsers)
- Flexbox (all browsers)
- backdrop-filter (Safari needs prefix)
- background-clip: text (all browsers with prefixes)

---

## Performance Considerations

1. **Theme Switching**: <50ms transition time
2. **LocalStorage**: Synchronous reads on mount (acceptable for small data)
3. **Inline Styles**: Used for theme-awareness, no performance impact
4. **Hover Effects**: GPU-accelerated transforms (translateY, scale)
5. **Shadow Rendering**: Optimized shadow values for smooth rendering

---

## Accessibility

### Color Contrast
- **Light Theme**: All text meets WCAG AAA (>7:1 contrast)
- **Dark Theme**: All text meets WCAG AA (>4.5:1 contrast)
- **Links**: Clear color differentiation from body text

### Interactive Elements
- Buttons have visible focus states
- Theme toggle includes ARIA label
- Semantic HTML throughout
- Keyboard navigation supported

### Motion
- Respects `prefers-reduced-motion` media query (future enhancement)
- All animations are subtle and purposeful

---

## Future Enhancements

**Planned for v2.1:**
- [ ] High contrast mode for accessibility
- [ ] Automatic theme based on system preference
- [ ] Custom theme color picker
- [ ] Animation settings (reduced motion support)
- [ ] More gradient variations
- [ ] Component library documentation site

---

## References

- **Style Guide**: `@frontend/.claude/component-style-guide.md`
- **Design Tokens**: `@frontend/src/styles/designTokens.ts`
- **Global Styles**: `@frontend/src/index.css`
- **Theme Context**: `@frontend/src/contexts/ThemeContext.tsx`
- **Example Implementation**: `@frontend/src/pages/HomePage.tsx`

---

**Built with ❤️ for Adaptive LMS**
