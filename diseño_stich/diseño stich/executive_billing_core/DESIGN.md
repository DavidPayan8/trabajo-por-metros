---
name: Executive Billing Core
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#006e28'
  on-secondary: '#ffffff'
  secondary-container: '#6ffb85'
  on-secondary-container: '#00732a'
  tertiary: '#894d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#ac6300'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#72fe88'
  secondary-fixed-dim: '#53e16f'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#00531c'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb874'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
  ios-blue: '#007AFF'
  ios-green: '#34C759'
  ios-orange: '#FF9500'
  ios-red: '#FF3B30'
  ios-gray: '#8E8E93'
  surface-background: '#F2F2F7'
  surface-grouped: '#FFFFFF'
  charcoal-text: '#1C1C1E'
typography:
  display:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.4px
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.4px
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.4px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.4px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.2px
  label-lg:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
  numeric-data:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  safe-area-inset: env(safe-area-inset-bottom)
  margin-main: 16px
  gutter-card: 12px
  touch-target-min: 44px
  stack-gap: 8px
  section-gap: 24px
---

## Brand & Style
The design system is engineered for high-efficiency utility, tailored specifically for the professional solo practitioner managing field-based billing. The brand personality is **utilitarian, precise, and authoritative**, mirroring the reliability required for financial transactions.

The chosen design style is **Corporate / Modern** with a strong emphasis on **Human Interface Guidelines (HIG)**. This ensures that the PWA feels indistinguishable from a native iOS application, leveraging the user's existing muscle memory on iPhone. The aesthetic focuses on clarity through generous whitespace, a strict typographic hierarchy, and high-contrast elements that remain legible under direct sunlight or in low-light job sites.

Emotional response:
- **Trust:** Solid, stable colors and structured layouts.
- **Efficiency:** Minimized friction through large touch targets and logical flows.
- **Focus:** Elimination of non-essential decorative elements to keep the user focused on the data.

## Colors
This design system utilizes a high-contrast, iOS-inspired palette to ensure professional familiarity and maximum readability. 

- **Primary (Blue):** Used for primary actions, navigation icons, and active states. 
- **Success (Green):** Specifically reserved for the `cobrado` (paid) state and confirmation actions.
- **Warning (Orange):** Used for the `pendiente_cobro` (pending) state, signaling an item requires attention but is not an error.
- **Critical (Red):** Used for destructive actions (Delete) and negative balances.
- **Neutrals:** The background uses the standard iOS "systemGroupedBackground" (`#F2F2F7`) to separate card-based content effectively. 

The default color mode is `light` to ensure clarity during daytime outdoor work, utilizing a deep charcoal (`#1C1C1E`) for text to provide superior contrast over a pure black.

## Typography
The system utilizes **Inter** as a highly legible alternative to San Francisco, ensuring a native feel within a web-based environment. 

The hierarchy is structured around a "Mobile-First Heading" strategy. Large titles (`display`) are used at the top of main views (e.g., "History", "Jobs") to provide immediate context. Body text is set to `17px` to match iOS standards for comfortable reading without zooming.

**Specialized Roles:**
- **Numeric Data:** Used for currency and meter readings, featuring slightly increased letter spacing and a semi-bold weight for rapid scanning of totals.
- **Labels:** Small, uppercase labels are used above input fields or to categorize metadata within cards.

## Layout & Spacing
The layout follows a **Fixed-Fluid hybrid** model optimized for the iPhone's aspect ratio. 

- **Margins:** A standard `16px` horizontal margin is applied to all main views.
- **Card Layouts:** Information is grouped into cards with a `12px` internal gutter. Cards should have a full-width appearance (minus margins) to maximize data visibility.
- **Touch Targets:** No interactive element (button, checkbox, list item) shall be smaller than `44px` in height to ensure ease of use on the move.
- **PWA Considerations:** The bottom navigation bar must account for the `safe-area-inset-bottom` to avoid interference with the iOS home indicator.
- **Reflow:** On wider screens (iPad/Desktop), the content is centered with a max-width of `600px` to maintain the mobile-optimized focus of the application.

## Elevation & Depth
This design system uses **Tonal Layers** rather than heavy shadows to signify depth, aligning with modern iOS aesthetics.

- **Level 0 (Background):** `#F2F2F7` - The canvas on which the app sits.
- **Level 1 (Cards/Containers):** `#FFFFFF` - Primary surface for all content. These use a very subtle, low-opacity border (`1px solid rgba(0,0,0,0.05)`) instead of a shadow to maintain a clean look.
- **Level 2 (Modals/Overlays):** These utilize a light backdrop blur (`saturate(180%) blur(20px)`) to indicate a temporary change in context while keeping the underlying data visible.

Depth is communicated through contrast. Content that is "above" the background is white, while interactive backgrounds in pressed states use a slightly darker neutral tint.

## Shapes
The shape language follows the **Rounded** (`0.5rem` or `8px`) standard. 

- **Standard Elements:** Buttons and input fields use `8px` corner radius.
- **Cards:** Large containers (List items, Job summaries) use `rounded-lg` (`16px`) to create a softer, more modern container feel.
- **Status Pills:** Indicators for `open`, `pending`, or `paid` use the `rounded-full` (pill) shape to clearly distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** High-saturation blue (`#007AFF`) background with white text. Full width for mobile forms.
- **Secondary:** Light gray background with blue text for less critical actions.
- **Destructive:** Red text or background for "Delete" or "Clear" actions.

### Cards
- White background, `16px` corner radius.
- Used for "Trabajo" list items, "Tipo de Metro" items, and "History" entries.
- Must include a subtle `:active` state that darkens the background slightly to indicate a touch.

### Status Indicators (Pills)
- **Abierto:** Blue tint background with blue text.
- **Pendiente:** Orange tint background with orange text.
- **Cobrado:** Green tint background with green text.

### Input Fields
- Minimum `44px` height.
- Background: `#FFFFFF` or a very light gray.
- Labels sit above the input in `label-lg` typography.
- For numeric inputs, the system should trigger the `decimal` keyboard on iOS.

### Navigation
- A bottom "Tab Bar" for the primary sections: **Trabajos**, **Tipos**, **Historial**.
- Use translucent background blur to allow content to peek through during scroll.

### Lists
- Standard iOS-style chevron (`>`) on the right side of list items that lead to a detail view.
- Grouped lists should have a clear header above the group.