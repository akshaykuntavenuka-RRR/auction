---
name: Elite Auction Broadcast
colors:
  surface: '#141315'
  surface-dim: '#141315'
  surface-bright: '#3b383b'
  surface-container-lowest: '#0f0e10'
  surface-container-low: '#1d1b1e'
  surface-container: '#211f22'
  surface-container-high: '#2b292c'
  surface-container-highest: '#363437'
  on-surface: '#e6e1e5'
  on-surface-variant: '#cbc4ce'
  inverse-surface: '#e6e1e5'
  inverse-on-surface: '#323033'
  outline: '#948f98'
  outline-variant: '#49454d'
  surface-tint: '#d1bfeb'
  primary: '#d1bfeb'
  on-primary: '#372a4d'
  primary-container: '#0a0020'
  on-primary-container: '#807099'
  inverse-primary: '#66577e'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#cfbdfe'
  on-tertiary: '#36275d'
  tertiary-container: '#080022'
  on-tertiary-container: '#7f6eaa'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ecdcff'
  primary-fixed-dim: '#d1bfeb'
  on-primary-fixed: '#211437'
  on-primary-fixed-variant: '#4e4065'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#cfbdfe'
  on-tertiary-fixed: '#201047'
  on-tertiary-fixed-variant: '#4d3d75'
  background: '#141315'
  on-background: '#e6e1e5'
  surface-variant: '#363437'
typography:
  display-lg:
    fontFamily: bebasNeue
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  display-md:
    fontFamily: bebasNeue
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: bebasNeue
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: bebasNeue
    fontSize: 28px
    fontWeight: '400'
    lineHeight: '1.2'
  stats-numeric:
    fontFamily: bebasNeue
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: 0.05em
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.6'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
---

## Brand & Style

The design system is engineered to capture the high-stakes adrenaline of a live sports broadcast. It targets a competitive audience, evoking feelings of prestige, urgency, and high-energy excitement. 

The aesthetic is a hybrid of **Glassmorphism** and **High-Contrast Bold**. It utilizes deep, infinite backgrounds to create a sense of stadium-like scale, while foreground elements use semi-transparent frosted surfaces to maintain a sense of modern tech-forwardness. The style incorporates sharp, geometric "slashes" and metallic accents to mimic the premium visual language of professional cricket broadcasting.

## Colors

The palette is anchored by a "Midnight Pitch" Deep Purple, providing a high-contrast foundation for the "Trophy Gold" accents.

- **Primary:** Deep Purple (#0a0020). Used for the core canvas and deep layering.
- **Accent:** Bright Gold (#FFD700). Reserved for "Primary Actions" (Bidding), Headlines, and Winner states. This should often be applied as a linear gradient to simulate a metallic finish.
- **Secondary:** Muted Purple (#6b5b95). Used for non-essential metadata and borders to maintain depth without distracting from active play.
- **Functional:** Success Green is utilized exclusively for currency and bid increments to signal positive progression.
- **Role Badges:** Specific high-chroma colors distinguish player categories (Batsman, Bowler, All-rounder, Wicket-keeper) for instant recognition in fast-paced auction environments.

## Typography

Typography follows a "Broadcast Information Density" model. 

Headings use **Bebas Neue** for an authoritative, cinematic feel. Its condensed nature allows for long player names and large currency figures to remain legible and impactful even on smaller mobile viewports.

Body text and UI labels use **Manrope**. This provides a technical, clean counterpoint to the expressive headlines. "Stats-numeric" should be used for all live numbers (bid prices, player stats) to ensure they feel like part of the broadcast score-bug. Use All-Caps for labels to reinforce the professional sports aesthetic.

## Layout & Spacing

This design system uses a **Fluid Grid** with a strict 8px baseline. 

- **Desktop:** 12-column layout. Content is centered with wide margins to create a "theatrical" focus on the central auction block.
- **Mobile:** 4-column layout. Margins are reduced to 16px to maximize the player card and bidding interface. 

Components like the "Live Bid Log" and "Player Profile" should utilize horizontal scrolling on mobile to keep the primary auction controls (the "Hammer Zone") fixed and accessible. Use "safe areas" at the top and bottom of mobile screens to prevent UI overlap with device notches or home indicators.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Inner Glows** rather than traditional drop shadows.

- **Level 1 (Pitch):** Solid Deep Purple background.
- **Level 2 (The Floor):** Semi-transparent (40% opacity) dark purple containers with a 1px solid stroke (20% white) to define edges.
- **Level 3 (Active Card):** High-opacity glass (80%) with a backdrop blur of 12px. These elements feature a subtle "Gold Leaf" inner glow (0.5px) to suggest they are illuminated by stadium spotlights.
- **Level 4 (Modals/Pop-ups):** Heavy backdrop blur (24px) with high-contrast Gold borders to command absolute attention.

Interactive elements should "glow" when active, using an outer bloom effect in Gold (#FFD700) or Success Green (#00C853) to signify the current highest bid or a successful transaction.

## Shapes

The shape language is aggressive and geometric. While the system uses a `Soft` roundedness (4px - 8px) for container corners to ensure a modern feel, it frequently utilizes **diagonal "clipped" corners** (chamfers) for buttons and badges to evoke the sharpness of movement and sport.

- **Standard Containers:** 8px radius.
- **Badges/Role Tags:** 4px radius or fully sharp.
- **Primary Action Buttons:** Use a 10-degree skew or clipped corner on the top-right and bottom-left to create a dynamic, forward-leaning appearance.

## Components

### Buttons
- **Primary (Bid):** Solid Gold gradient background. Black text (Bebas Neue). Inner glow for a "metallic" feel.
- **Secondary:** Transparent with a 2px Gold stroke. Gold text.
- **Danger (Retract):** Muted Purple background with white text to remain secondary to the main action.

### Player Cards
The centerpiece of the UI. Feature a large player portrait with a vertical gradient overlay (transparent to Deep Purple). Stats should be displayed in a 2x2 grid using the `stats-numeric` typography.

### Role Badges
Small, pill-shaped tags with high-chroma background colors and white text. These should be placed in the top-left corner of any player-related component.

### Input Fields
Dark, sunken fields with a 1px secondary purple border. On focus, the border transitions to Gold with a subtle outer glow.

### Bid History List
A scrolling feed of items. The "Current Bid" (top item) should be 20% larger than previous bids, featuring a Success Green text color and a pulsating light effect to indicate it is the live price.