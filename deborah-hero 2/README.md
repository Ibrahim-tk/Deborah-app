# Deborah landing hero

A reusable React implementation of the supplied Deborah concept, with a responsive navbar, real hero text, purple-tree landscape and an independently reusable branded footer. Plain CSS; no UI library, Tailwind, icon package, or hosted asset service is required.

## Use in your React project

Copy `DeborahLanding.jsx`, `DeborahLanding.css`, and the entire `assets/` directory together into your source tree. React 18+ is required. Your bundler must support JSX, CSS, and image imports (the included Vite preview does).

```jsx
import DeborahLanding from './components/deborah/DeborahLanding.jsx';

export default function HomePage() {
  return (
    <DeborahLanding
      getStartedHref="/signup"
      loginHref="/login"
      learnMoreHref="/about"
    />
  );
}
```

The component imports its own CSS. It does not reset your application's `body`; remove default body margins in your own global stylesheet for an edge-to-edge layout. Use it in a full-width layout, outside any constrained content wrapper.

## Use the footer on every page

```jsx
import { DeborahFooter } from './components/deborah/DeborahLanding.jsx';

<DeborahFooter
  links={[
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ]}
/>
```

Named exports `DeborahNavbar`, `DeborahHero`, and `DeborahFooter` can also be composed inside your existing application layout. This avoids duplicate `main`, header, or footer landmarks. `defaultNavigation` is exported for convenience.

## Configuration

| Complete-page prop | Default / purpose |
| --- | --- |
| `navigation` | Array of `{ label, href }` for Home, About, How It Works, Services, Resources |
| `activeHref` | `/`; sets `aria-current` on the matching link |
| `homeHref` | `/`; brand link |
| `loginHref` | `/login` |
| `getStartedHref` | `/get-started`; shared navbar and hero CTA |
| `learnMoreHref` | `/about` |
| `footerLinks` | Privacy, Terms, Contact route links |
| `title`, `description`, `eyebrow` | Exact wording from the supplied reference; `eyebrow=""` hides the label |
| `logoSrc`, `portraitSrc`, `backgroundSrc` | Optional replacement assets |
| `showFooter` | `true` |
| `className` | Extra class on the page wrapper |

The standalone navbar uses `links` rather than `navigation`. The standalone footer uses `links` rather than `footerLinks` and accepts `year`. The hero also accepts `portraitAlt`.

Links are standard anchors. Supply your application's real route URLs before publishing. This package implements the requested visual components; it does not implement account creation, authentication, informational pages, or legal policies. The included preview only renders the landing page. For client-side navigation without reloads, replace anchors with your router's link component in the single JSX file.

For Next.js App Router, the component includes `'use client'` and normalizes static image imports. Import it from your page. If your framework restricts component-level global CSS imports, move the CSS import to your root layout/global entry.

## Run the included preview

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`; inspect it using `npm run preview`. The `demo.jsx`, `index.html`, and package files are only for the standalone preview and are not needed when copying the component into an existing app.

## Fidelity and assets

- Copy, branding, composition, and palette follow the supplied `image(10).png` reference.
- `assets/deborah-tree.webp` is a clean landscape made using the built-in image generation tool to remove text and interface elements from that reference. The original tree, lake, mountains and path composition are closely preserved; the cleaned sky has a slight warmer color variation. The complete prompt is in `ASSET-PROVENANCE.md`.
- `assets/reference-sprite.webp` is a lossless WebP version of the supplied reference. CSS shows only its original flower mark and portrait; neither has been redrawn or regenerated. The full source is retained because isolated original assets were not provided. Set `logoSrc` and `portraitSrc` to your production originals when available, then remove the sprite import and fallback branches if you want to eliminate its download.
- Cormorant Garamond Regular is bundled locally, with its SIL Open Font License. It is a close visual approximation; the exact original font was not supplied.
- Mobile deliberately moves the scenic image beneath the copy to preserve legibility. The footer follows the same brand styling and is a new addition to the supplied hero.

CSS selectors are prefixed `deborah-`. Theme colors are declared at the start of the stylesheet. Assets and fonts are served locally; there are no runtime requests to Google Fonts or stock-image services.

## Accessibility and behavior

Semantic landmarks, a skip link, visible keyboard focus, decorative background alt text, portrait label, active navigation state, reduced-motion support, and a native disclosure button. The mobile menu supports Escape (returning focus to its button), outside clicks, tabbing out, link selection, and switching to desktop layout. It is a navigation disclosure, not a modal, so it intentionally does not trap focus.
