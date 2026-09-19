/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#282524',
    tint: '#e56f5d',

    // Core surfaces
    background: '#fcf7f1',
    foreground: '#282524',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#282524',

    // Primary action color (buttons, links, active states)
    primary: '#e56f5d',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#4e938d',
    secondaryForeground: '#ffffff',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#f3ebe3',
    mutedForeground: '#756d68',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#f7dfd8',
    accentForeground: '#282524',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#eadfd6',
    input: '#ddcec4',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 18,
};

export default colors;
