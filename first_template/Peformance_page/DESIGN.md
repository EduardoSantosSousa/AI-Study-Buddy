---
name: Cognitive Focus
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464553'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777584'
  outline-variant: '#c8c4d5'
  surface-tint: '#544fc0'
  primary: '#1f108e'
  on-primary: '#ffffff'
  primary-container: '#3730a3'
  on-primary-container: '#a9a7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#6b38d4'
  on-secondary: '#ffffff'
  secondary-container: '#8455ef'
  on-secondary-container: '#fffbff'
  tertiary: '#2b2c35'
  on-tertiary: '#ffffff'
  tertiary-container: '#42424b'
  on-tertiary-container: '#afaeba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3b35a7'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#e3e1ed'
  tertiary-fixed-dim: '#c7c5d1'
  on-tertiary-fixed: '#1a1b23'
  on-tertiary-fixed-variant: '#46464f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max-width: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered to foster a state of "flow" for learners. The brand personality is **helpful, smart, and encouraging**, acting as a silent tutor that clears away distractions rather than adding to them. 

The aesthetic follows a **Modern Minimalist** approach with a **Tactile** edge. By utilizing generous whitespace, we reduce cognitive load, ensuring that the AI-driven insights remain the focal point. The interface uses high-quality typography and soft geometry to feel approachable yet authoritative, ensuring students feel supported through complex subjects.

## Colors
The palette is rooted in **Deep Indigo** for core navigation and primary structural elements, providing a sense of stability and intelligence. **Vibrant Violet** serves as the "action" color, used for AI interactions, progress buttons, and highlights to keep the energy high.

Backgrounds utilize a tiered system of **Soft Grays**. The base canvas is nearly white to maintain cleanliness, while secondary containers use subtle cool-gray washes to create logical grouping. Feedback colors (Green/Red) are saturated enough to be clear but are often paired with soft tinted backgrounds to remain encouraging rather than punishing.

## Typography
We use **Hanken Grotesk** for headlines to provide a sharp, contemporary "tech-forward" feel. Its precise geometry suggests the intelligence of the AI. For all functional text, body copy, and inputs, we use **Inter**. Inter’s tall x-height and exceptional legibility ensure that long study sessions do not result in eye strain.

Hierarchy is strictly enforced: 
- Use **Display-LG** only for welcome screens or major milestones.
- **Headline-LG** is the default for page titles.
- **Body-MD** is the workhorse for most educational content.
- **Label-SM** is reserved for metadata, tags, and secondary button text.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop to prevent educational content from becoming too wide to read comfortably (ideal line length is maintained within the central column). 

We employ a 12-column grid for desktop and a 4-column grid for mobile. The spacing rhythm is based on an **8px base unit**. 
- **Content Density:** Use `stack-lg` (32px) between major card sections to ensure the UI feels "airy."
- **Internal Padding:** Cards and containers should never have less than 24px of internal padding to maintain the premium, clean aesthetic.
- **Mobile Reflow:** On mobile, side-by-side cards should stack vertically to maximize the horizontal space for text legibility.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. This design system avoids harsh black shadows in favor of "Soft Indigo" blurs.

1.  **Level 0 (Canvas):** The base background (#F9FAFB).
2.  **Level 1 (Cards):** Pure white surfaces with a very soft, diffused shadow (15% opacity Indigo, 20px blur, 4px Y-offset).
3.  **Level 2 (Overlays/Modals):** These use a stronger shadow and a subtle 1px border (#E5E7EB) to distinguish them from the cards below.
4.  **Active State:** Elements being interacted with (like a selected quiz answer) use a 2px Vibrant Violet stroke rather than increased elevation to keep the interface feeling flat and modern.

## Shapes
The shape language is defined by **large, friendly radii**. This "Rounded" setting (0.5rem base) extends to `rounded-xl` (1.5rem/24px) for main content cards. These softer corners psychologically signal a safe, low-stress environment for learning.

- **Primary Cards:** 24px (rounded-xl)
- **Buttons & Inputs:** 12px (rounded-lg)
- **Chips/Tags:** Pill-shaped (fully rounded)
- **Selection Indicators:** 8px (rounded-md)

## Components
### Buttons
- **Primary:** Vibrant Violet background, white text. High-contrast.
- **Secondary:** Soft Indigo tint background (#EEF2FF) with Deep Indigo text.
- **Tertiary:** Ghost style, no background, just text with an icon.

### Cards
Cards are the primary container for study modules. They must feature a white background, 24px corner radius, and the standard ambient shadow. Use a 1px soft gray border only if the card is placed on a white background.

### Input Fields
Inputs should feel spacious. Use a 12px corner radius and a 16px horizontal padding. The focus state transitions the border to Vibrant Violet with a 3px soft glow.

### Progress Bars
Always use a rounded track. The "filled" portion should use a gradient from Deep Indigo to Vibrant Violet to signify "energy" and "movement" toward the goal.

### Feedback Toasts
Success toasts use a Soft Green background with dark green text, positioned at the top center to celebrate small wins (like a correct answer) without blocking the main content.