/**
 * Token catalog — the names (not values) the design system page shows. Values are read live (parts/live.ts).
 * Grouped as in src/apps/mobile/styles/mobile.tokens.css and mobile.skin.deborah.css.
 */
import type { IconName } from '@mobile/ui';

export interface TokenDef {
  name: string;
  use: string;
}

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
export const RAMPS: { name: string; tokens: string[] }[] = [
  { name: 'Purple', tokens: steps.map((s) => `--purple-${s}`) },
  { name: 'Gold', tokens: steps.map((s) => `--gold-${s}`) },
  { name: 'Pink', tokens: steps.map((s) => `--pink-${s}`) },
  { name: 'Midnight', tokens: steps.map((s) => `--midnight-${s}`) },
];

export const COLOR_GROUPS: { title: string; note?: string; text?: boolean; tokens: TokenDef[] }[] = [
  {
    title: 'Surfaces',
    tokens: [
      { name: '--color-canvas', use: 'Behind every screen' },
      { name: '--color-surface', use: 'Sheets, raised surfaces' },
      { name: '--surface-1', use: 'Translucent option rows and cards' },
      { name: '--surface-1-pressed', use: 'Pressed surface' },
      { name: '--color-surface-tonal', use: 'Linen / peach tonal panels' },
      { name: '--color-surface-lilac', use: 'User bubbles, secondary fill' },
      { name: '--color-surface-signature', use: 'Rare dark signature surface' },
      { name: '--color-scrim', use: 'Behind sheets and modals' },
    ],
  },
  {
    title: 'Text',
    note: 'Contrast is measured live against the canvas. Readable text must reach 7:1 (CLAUDE.md rule 8).',
    text: true,
    tokens: [
      { name: '--color-ink', use: 'Headings, primary text, icons' },
      { name: '--color-ink-body', use: "Deborah's reading prose" },
      { name: '--color-ink-secondary', use: 'Secondary text, subtitles' },
      { name: '--color-ink-tertiary', use: 'Metadata, timestamps' },
      { name: '--color-ink-placeholder', use: 'Placeholders only' },
      { name: '--color-gold-ink', use: 'Answer numerals (gold as text)' },
      { name: '--color-deborah-rose', use: "Deborah's sign-off only" },
    ],
  },
  {
    title: 'Action',
    note: 'The One Action Colour Rule: only the accent means “you can do something here”.',
    tokens: [
      { name: '--color-accent', use: 'Primary buttons, links, progress' },
      { name: '--color-accent-pressed', use: 'Pressed primary' },
      { name: '--color-accent-tint', use: 'Selected option fill' },
      { name: '--color-accent-tint-pressed', use: 'Pressed tint' },
      { name: '--selected-tint', use: 'Selected rows' },
      { name: '--color-focus', use: 'Focus ring (3 px, 4 px offset)' },
      { name: '--button-primary-fill', use: 'Primary button fill' },
      { name: '--color-ink-on-accent', use: 'Text on the accent' },
    ],
  },
  {
    title: 'Borders',
    tokens: [
      { name: '--color-border-hairline', use: 'Decorative dividers, card outlines' },
      { name: '--color-border-control', use: 'Input and option outlines' },
      { name: '--field-border', use: 'Text field outline' },
      { name: '--surface-border', use: 'Translucent surface rim' },
      { name: '--color-border-selected', use: 'Selected outline' },
    ],
  },
  {
    title: 'Brand and cards',
    tokens: [
      { name: '--color-gold', use: 'Deborah signature moments' },
      { name: '--card-tone-lilac', use: 'Tonal card' },
      { name: '--card-tone-linen', use: 'Tonal card' },
      { name: '--card-tone-rose', use: 'Tonal card' },
      { name: '--card-tone-paper', use: 'Tonal card' },
      { name: '--card-action-bg', use: 'Round card action' },
    ],
  },
];

/** Semantic pairs: ink on tint. Every state also carries an icon and words. */
export const SEMANTIC: { role: string; ink: string; tint: string }[] = [
  { role: 'Danger', ink: '--color-danger-ink', tint: '--color-danger-tint' },
  { role: 'Success', ink: '--color-success-ink', tint: '--color-success-tint' },
  { role: 'Warning', ink: '--color-warning-ink', tint: '--color-warning-tint' },
];

export const TYPE_ROLES: { cls: string; role: string; use: string; sample: string }[] = [
  { cls: 't-display', role: 'display', use: 'Large titles on tab roots, Welcome', sample: 'Good evening, Maria' },
  { cls: 't-title-1', role: 'title-1', use: 'Sheet and modal titles, greeting', sample: 'How are you feeling today?' },
  { cls: 't-title-2', role: 'title-2', use: 'Card headings, empty states', sample: 'Your 90-day plan' },
  { cls: 't-title-3', role: 'title-3', use: 'Inline navigation titles', sample: 'Health profile' },
  { cls: 't-headline', role: 'headline', use: 'Answer section titles, list row titles', sample: 'What I’m hearing' },
  { cls: 't-body', role: 'body', use: "Deborah's answers, message text", sample: 'Let’s look at what your body is telling you, one step at a time.' },
  { cls: 't-callout', role: 'callout', use: 'Card body, options, inputs', sample: 'Tap the answer that fits best.' },
  { cls: 't-button', role: 'button', use: 'Every button label', sample: 'Continue' },
  { cls: 't-subhead', role: 'subhead', use: 'Secondary text, list subtitles', sample: '3 free consultations left' },
  { cls: 't-footnote', role: 'footnote', use: 'Disclaimers, helper text, legal', sample: 'Educational only. Not a substitute for care.' },
  { cls: 't-caption', role: 'caption', use: 'Tab labels, timestamps, counters', sample: 'Today · 9:41' },
  { cls: 't-data', role: 'data', use: 'Lab values, prices, dates', sample: 'Day 12 of 90 · $49.00 · 10:30' },
];

export const SPACE = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((n) => `--space-${n}`);

export const RADII: TokenDef[] = [
  { name: '--radius-sm', use: 'Checkbox, thumbnails' },
  { name: '--radius-md', use: 'Segmented, inline media' },
  { name: '--radius-lg', use: 'Options, inputs, toasts' },
  { name: '--radius-xl', use: 'Sheets, composer, bubbles' },
  { name: '--radius-card-sm', use: 'Small tonal cards' },
  { name: '--radius-card', use: 'Tonal cards' },
  { name: '--radius-full', use: 'Buttons, avatars, switches' },
];

export const SHADOWS: TokenDef[] = [
  { name: '--shadow-float-sm', use: 'Menus, toasts' },
  { name: '--shadow-float-md', use: 'Composer, floating bars' },
  { name: '--shadow-float-lg', use: 'Bottom sheets' },
  { name: '--shadow-soft', use: 'Translucent surfaces' },
  { name: '--button-primary-shadow', use: 'Primary button lift' },
];

export const LAYOUT: TokenDef[] = [
  { name: '--margin-screen', use: 'Left / right screen margin' },
  { name: '--tap-min', use: 'Minimum touch target' },
  { name: '--row-min', use: 'List and option rows' },
  { name: '--button-h', use: 'Button height' },
  { name: '--field-h', use: 'Text field height' },
  { name: '--button-h-emergency', use: 'Emergency button' },
  { name: '--header-h', use: 'App bar' },
  { name: '--tabbar-h', use: 'Floating tab bar' },
];

export const DURATIONS: TokenDef[] = [
  { name: '--dur-quick', use: 'State changes' },
  { name: '--dur-base', use: 'Fades, accordions' },
  { name: '--dur-screen', use: 'Screen push' },
  { name: '--dur-sheet', use: 'Sheets' },
];
export const EASINGS: TokenDef[] = [
  { name: '--ease-ios', use: 'Navigation and sheets' },
  { name: '--ease-out', use: 'Small state changes' },
];

export const ICONS: IconName[] = [
  'chat', 'health', 'account', 'mic', 'bell', 'settings', 'send', 'stop', 'back', 'close', 'info', 'check', 'chevron',
  'chevronDown', 'plus', 'eye', 'eyeOff', 'lock', 'shop', 'calendar', 'upload', 'camera', 'file', 'phone', 'alert',
  'copy', 'listen', 'thumbsUp', 'thumbsDown', 'share', 'pdf', 'note', 'book', 'video', 'refresh', 'more', 'medicine',
  'location', 'external', 'apple', 'google', 'mail', 'delete', 'edit', 'labs', 'success', 'play', 'search', 'menu',
  'aiSearch', 'family', 'appleFilled', 'deborah',
];
