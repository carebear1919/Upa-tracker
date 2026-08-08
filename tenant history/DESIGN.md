---
name: Serene Hearth
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#404943'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#a7373b'
  on-secondary: '#ffffff'
  secondary-container: '#ff7a7a'
  on-secondary-container: '#74101a'
  tertiary: '#3a4e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e6800'
  on-tertiary-container: '#c4e771'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b0'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#861f25'
  tertiary-fixed: '#ccf078'
  tertiary-fixed-dim: '#b0d360'
  on-tertiary-fixed: '#151f00'
  on-tertiary-fixed-variant: '#394d00'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  tap-target-min: 48px
  stack-gap: 20px
---

## Brand & Style

The design system is centered on clarity, accessibility, and emotional warmth. It is specifically tailored for older users who require high legibility and a low-stress interface for managing property finances. The aesthetic combines **Minimalism** with **Tactile** cues, using generous whitespace to reduce cognitive load and physical metaphors—like large, easy-to-press buttons—to ensure confidence in interaction.

The personality is reliable and supportive. It avoids "techy" trends in favor of a calm, organic feel that mimics high-quality printed materials. Every element is designed to evoke a sense of organized tranquility, ensuring that tracking expenses feels like a manageable task rather than a digital chore.

## Colors

This design system utilizes a high-contrast, nature-inspired palette to signal financial status intuitively.

- **Primary (Sage Green):** Used for all positive financial actions, including "Paid" statuses, income entries, and primary "Save" or "Add" actions.
- **Secondary (Terracotta):** Used for negative financial actions, including "Unpaid" statuses, expenses, and alerts.
- **Background (Cream):** A soft off-white used for the global background to reduce eye strain compared to pure white.
- **Text (Charcoal):** A near-black used for all copy to ensure a high contrast ratio (at least 7:1) against the cream background.
- **Surface:** Pure white (#FFFFFF) is reserved for cards and containers to create a subtle lift from the cream background.

## Typography

Typography is the most critical pillar of this design system. It uses **Inter** for its exceptional legibility and modern, clean letterforms. 

- **Scale:** Font sizes are intentionally larger than standard web patterns. The minimum body size is 18px to ensure readability for users with presbyopia.
- **Line Height:** A generous 1.5x to 1.6x line height is applied to body text to prevent lines from "blurring" together.
- **Weight:** Medium and Bold weights are used frequently for emphasis, as thin fonts can be difficult to perceive on light backgrounds.
- **Accessibility:** Avoid all font sizes below 16px. Ensure all text blocks have a maximum width of 60-70 characters to maintain focus.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy on desktop (max-width 800px) to keep content centered and easy to scan. On mobile, it uses a single-column fluid layout with wide margins.

- **Rhythm:** An 8px linear scale is used, but preferred increments are larger (16, 24, 32, 48) to create "breathing room."
- **Touch Targets:** All interactive elements must be a minimum of 48px in height/width, with 56px being the preferred standard for primary actions.
- **Negative Space:** Use white space aggressively to separate unrelated items. Avoid dense clusters of information; if a screen feels "busy," split the content across multiple steps.

## Elevation & Depth

To aid users with depth perception, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

- **Level 0 (Background):** The Cream (#FAF9F6) base layer.
- **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a very soft, large-radius shadow (Blur: 16px, Y: 4px, Color: rgba(0,0,0, 0.05)). This makes the card feel like a physical piece of paper resting on a table.
- **Level 2 (Active/Floating):** Used for active input fields or buttons. These use a slightly more defined shadow (Blur: 24px, Y: 8px, Color: rgba(0,0,0, 0.08)) to indicate they are "closer" to the user and ready for interaction.
- **Outlines:** Use 2px solid borders in a light gray (#E5E5E5) for form fields to ensure the boundaries are unmistakable.

## Shapes

The shape language is friendly and approachable. 
- **Standard Radius:** 12px for small components like tags and input fields.
- **Large Radius (rounded-lg):** 24px for cards and primary containers.
- **Pill (rounded-full):** Used exclusively for status badges (e.g., "Paid") to distinguish them from functional buttons.

## Components

### Buttons
Primary buttons use the Sage Green background with white text. They must include a leading icon (minimum 24px size) to provide a visual cue for the action. Secondary buttons (for expenses) use the Terracotta color. Buttons should span the full width of their container on mobile for easy thumb-tapping.

### Input Fields
Inputs must have a visible 2px border at all times. Labels should stay above the field (never use floating labels that disappear). Add "Helper Text" below the field in a 16px font to explain exactly what information is needed.

### Status Tags
Tags use a high-saturation background with white text for maximum contrast. "Paid" = Sage Green, "Due" = Terracotta, "Pending" = Muted Gold. Use large, bold uppercase text for labels.

### Progress Bars
Simple, thick bars (12px height) used to show monthly spending vs. budget. Use Sage Green for the "filled" portion. Avoid thin lines or complex radial gauges.

### List Items
Rental units or expense items should be displayed as large cards. Each row in the card must have a minimum height of 64px to ensure the user can tap into the record without precision issues.