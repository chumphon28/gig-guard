---
name: Secure Decentralized Trust
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin: 32px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is built upon the pillars of **security, transparency, and approachability**. To bridge the gap between traditional finance and the decentralized web, the style adopts a **Modern FinTech** aesthetic with subtle **Glassmorphism** accents. 

The visual language communicates institutional-grade reliability through a structured grid and a disciplined color palette, while maintaining a user-friendly "human" feel through soft geometry and generous whitespace. This system avoids the "gamer" or "hyper-crypto" tropes, opting instead for a clean, editorial-tech look that reassures users their assets are safe. High-transparency layers represent the open-ledger nature of the DAO, while solid primary surfaces ground the experience in stability.

## Colors

The palette is anchored by **Deep Navy (#0F172A)**, providing a foundation of authority and professional stability. **Security Green (#10B981)** is utilized as the primary action and status color, reinforcing the concept of "Verified" and "Safe." 

A technical **Electric Blue (#3B82F6)** serves as a tertiary accent for interactive elements and data highlights. The background utilizes **Clean Whites (#FFFFFF)** and **Subtle Greys (#F8FAFC)** to ensure the interface feels breathable and modern. Status indicators use high-clarity semantic tokens: Green for "Escrow Released," Amber for "In Dispute," and Navy for "Funds Locked."

## Typography

This design system uses **Manrope** across all levels to achieve a balanced, modern, and highly legible interface. The typeface’s geometric structure provides the "tech" feel required for a Web3 product, while its humanist traits maintain the "approachable" brand promise.

Headlines use tighter letter-spacing and heavier weights to command attention and denote hierarchy. Body text is optimized for readability with generous line heights, ensuring complex financial details and legal terms are easily digestible. All caps are reserved strictly for small labels and status indicators to maintain a professional, administrative tone.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop (12 columns) and a fluid model on mobile. A strict 8px base unit governs all spatial relationships, ensuring mathematical harmony across the UI. 

Content is organized into logical "Trust Blocks"—grouped sections with consistent internal padding. Wide margins and gutters are used to prevent information density from overwhelming the user, which is critical in an escrow environment where clarity is paramount. Vertical rhythm is maintained through three primary stack scales to clearly separate conceptual groups of data.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The design system avoids heavy drop shadows, opting instead for ultra-diffused, low-opacity shadows (Blur: 20px, Y: 4px, Color: Navy 5%) that make cards appear to float slightly above the base surface.

A unique "Verification Depth" is used for the escrow status area: a semi-transparent backdrop blur (Glassmorphism) is applied to secondary panels to suggest transparency. Important interactive elements like the 'Porm-Verified' badge use a subtle inner glow to appear "etched" or "authenticated" within the UI.

## Shapes

The design system employs a **Rounded (Level 2)** shape language. This specific radius (0.5rem base) strikes a precise balance between the sharpness of traditional enterprise software and the playfulness of consumer apps. 

Containers use `rounded-lg` (1rem) to frame information softly, while buttons and input fields use the standard `rounded` (0.5rem) to maintain a crisp, functional appearance. Status pills and the trust badge utilize a full "pill" radius to distinguish them from structural layout elements, signaling their status as dynamic metadata.

## Components

### Porm-Verified Badge
A signature component featuring a dual-tone shield icon. It utilizes a subtle gradient of Security Green and a glass-morphic background. It must always be accompanied by a "Verified" tooltip explaining the DAO's verification criteria.

### Escrow Status Indicators
Pill-shaped components with high-contrast text. 
- **Active:** Deep Navy background with White text.
- **Secured:** Green background with Deep Navy text.
- **Action Required:** Amber background with Black text.

### Buttons
- **Primary:** Deep Navy with white text; slight elevation on hover.
- **Success/Escrow:** Security Green with Deep Navy text; used exclusively for "Release Funds" or "Confirm Transaction."
- **Ghost:** Transparent with a 1px border; used for secondary navigation or "Cancel" actions.

### Cards & Inputs
Cards use a 1px border (#E2E8F0) rather than heavy shadows to maintain a clean FinTech look. Input fields use a focus state with a 2px blue ring and a subtle background tint change to ensure the user feels "locked in" during data entry.

### Progress Stepper
A specialized component for the escrow lifecycle (Funds Deposited -> Work Submitted -> Review -> Funds Released). It uses a connecting line and circular nodes that fill with Security Green as milestones are achieved.