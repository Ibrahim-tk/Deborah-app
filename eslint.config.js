// Layer boundaries from docs/01-architecture.md §3 and docs/02-folder-structure.md §3.
// A violation is a lint error: shell / shared / styles / mobile / web, and screens → patterns → ui inside each app.
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import boundaries from 'eslint-plugin-boundaries';

const APPS = ['mobile', 'web'];

// Elements are folders (each pattern covers everything below it). Most specific first: first match wins.
// `<app>-entry` is the app root folder, so it only catches files directly inside it (MobileApp.tsx / WebApp.tsx).
const LAYERS = { styles: 'styles', nav: 'navigation', screens: 'screens', patterns: 'patterns', ui: 'ui', hooks: 'hooks' };
const appElements = APPS.flatMap((app) => [
  ...Object.entries(LAYERS).map(([layer, dir]) => ({
    type: `${app}-${layer}`,
    pattern: `src/apps/${app}/${dir}`,
    partialMatch: false,
  })),
  { type: `${app}-entry`, pattern: `src/apps/${app}`, partialMatch: false },
]);

const elements = [
  ...appElements,
  { type: 'shell', pattern: 'src/shell', partialMatch: false },
  { type: 'shared', pattern: 'src/shared', partialMatch: false },
  { type: 'styles', pattern: 'src/styles', partialMatch: false },
  { type: 'root', pattern: 'src', partialMatch: false }, // main.tsx, App.tsx, vite-env.d.ts
];

// The only shell file apps may import: useDevice() (docs/01-architecture.md §3).
const files = [{ category: 'device-api', pattern: 'src/shell/device/index.ts' }];

const to = (...types) => ({ to: { element: { types: { anyOf: types } } } });
const allow = (from, ...types) => ({ from: { element: { type: from } }, allow: to(...types) });
const deviceApi = { to: { element: { type: 'shell' }, file: { categories: 'device-api' } } };

// Inside an app: screens → patterns → ui, never upward or sideways. Mobile and web never meet.
const appPolicies = APPS.flatMap((app) => {
  const own = (...layers) => layers.map((l) => `${app}-${l}`);
  return [
    allow(`${app}-entry`, 'shared', 'styles', ...own('entry', 'styles', 'nav', 'hooks')),
    allow(`${app}-nav`, 'shared', 'styles', ...own('nav', 'screens', 'ui', 'hooks')),
    allow(`${app}-screens`, 'shared', 'styles', ...own('screens', 'patterns', 'ui', 'hooks', 'nav')),
    allow(`${app}-patterns`, 'shared', 'styles', ...own('patterns', 'ui')),
    allow(`${app}-ui`, 'shared', 'styles', ...own('ui')),
    // Hooks are screen-level helpers: they may drive navigation.
    allow(`${app}-hooks`, 'shared', 'styles', ...own('hooks', 'nav')),
    allow(`${app}-styles`, 'styles', ...own('styles')),
  ];
});

const policies = [
  allow('root', 'root', 'shell', 'styles', 'shared'),
  allow('shell', 'shell', 'shared', 'styles', 'mobile-entry', 'web-entry'),
  allow('shared', 'shared'),
  allow('styles', 'styles'),
  ...appPolicies,
  // Mobile only (not web) may reach the shell, and only through the device API.
  { from: { element: { type: 'mobile-*' } }, allow: deviceApi },
];

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'design-tokens', 'public'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Inline styles only for dynamic custom properties (CLAUDE.md rule 3).
      'no-restricted-syntax': [
        'warn',
        {
          selector: "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.type='Identifier']",
          message: 'Use a CSS Module. Inline style is only for dynamic custom properties (e.g. { "--progress": 0.6 }).',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': elements,
      'boundaries/files': files,
      'boundaries/include': ['src/**/*'],
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
    },
    rules: {
      'boundaries/dependencies': ['error', { default: 'disallow', policies }],
      'boundaries/no-unknown-files': 'error',
    },
  },
  // shared is non-visual: no CSS, no DOM rendering, no apps or shell.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['*.css'], message: 'src/shared is non-visual: no CSS.' },
            { group: ['react-dom', 'react-dom/*'], message: 'src/shared is non-visual.' },
            { group: ['@mobile/*', '@web/*', '@shell/*', '@styles/*'], message: 'src/shared imports only from src/shared.' },
          ],
        },
      ],
    },
  },
  // Third-party UI libraries enter only through their adapters (CLAUDE.md rule 7).
  {
    files: ['src/apps/**/*.{ts,tsx}'],
    ignores: ['src/apps/*/ui/Icon/**', 'src/apps/*/ui/Motion/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@hugeicons/*'], caseSensitive: true, message: 'Use the Icon adapter in ui/Icon.' },
            { group: ['motion/*', 'framer-motion/*'], caseSensitive: true, message: 'Use the Motion adapter in ui/Motion.' },
          ],
          paths: [
            { name: 'motion', message: 'Use the Motion adapter in ui/Motion.' },
            { name: 'framer-motion', message: 'Use the Motion adapter in ui/Motion.' },
          ],
        },
      ],
    },
  },
);
