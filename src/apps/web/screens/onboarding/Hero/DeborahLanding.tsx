import { useEffect, useId, useRef, useState } from 'react';
import { persona } from '@shared/data';
import { Button, TextReveal } from '@web/ui';
import treeBackground from './assets/deborah-tree.webp';
import './DeborahLanding.css';

type NavLink = { label: string; href: string };
type Asset = string | { src: string };

const assetUrl = (asset: Asset) => (typeof asset === 'string' ? asset : asset?.src);

const LOGO_SRC = '/images/splash/tree-of-life.svg';

export const defaultNavigation: NavLink[] = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#' },
  { label: 'How It Works', href: '#' },
  { label: 'Services', href: '#' },
  { label: 'Resources', href: '#' },
];

const referenceDescription =
  'Bring me your questions about sleep, hormones, energy or your cycle. I’ll listen closely, explain what your body may be telling you in plain words, and help you see what to do next.';

function Brand({ homeHref = '#', compact = false }: { homeHref?: string; compact?: boolean }) {
  return (
    <a
      className={`deborah-brand${compact ? ' deborah-brand--small' : ''}`}
      href={homeHref}
      aria-label={`${persona.brand.appName} — home`}
    >
      <img className="deborah-brand__logo" src={LOGO_SRC} alt="" width={44} height={44} />
      <span className="deborah-brand__name">{persona.brand.appName}</span>
    </a>
  );
}

export function DeborahNavbar({
  links = defaultNavigation,
  activeHref = '#',
  homeHref = '#',
  onGetStarted,
  onLogin,
}: {
  links?: NavLink[];
  activeHref?: string;
  homeHref?: string;
  onGetStarted?: () => void;
  onLogin?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1100px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  return (
    <header className="deborah-header" ref={headerRef}>
      <div className="deborah-header__fade" aria-hidden />
      <div className="deborah-header__inner">
        <Brand homeHref={homeHref} />
        <button
          ref={toggleRef}
          className="deborah-menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen(!open)}
        >
          <span>{open ? 'Close' : 'Menu'}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 7h16M4 12h16M4 17h16'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <nav
          id={menuId}
          className="deborah-navigation"
          aria-label="Main navigation"
          data-open={open}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a,button')) setOpen(false);
          }}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node) &&
              !toggleRef.current?.contains(event.relatedTarget as Node)
            ) {
              setOpen(false);
            }
          }}
        >
          <ul className="deborah-navigation__links">
            {links.map(({ label, href }) => (
              <li key={`${label}-${href}`}>
                <a href={href} aria-current={href === activeHref ? 'page' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="deborah-navigation__actions">
            <Button variant="ghost" size="md" onClick={onLogin}>
              Log in
            </Button>
            <Button variant="primary" size="md" onClick={onGetStarted}>
              Get started
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function DeborahHero({
  title = 'Your body is speaking. Let’s listen together.',
  description = referenceDescription,
  backgroundSrc = treeBackground,
  onGetStarted,
}: {
  title?: string;
  description?: string;
  eyebrow?: string;
  backgroundSrc?: Asset;
  portraitSrc?: Asset;
  portraitAlt?: string;
  onGetStarted?: () => void;
}) {
  const descText = description || referenceDescription;

  return (
    <section className="deborah-hero" aria-label={title}>
      <img
        className="deborah-hero__landscape"
        src={assetUrl(backgroundSrc)}
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className="deborah-hero__wash" aria-hidden="true" />
      <div className="deborah-hero__inner">
        <div className="deborah-hero__content">
          <TextReveal as="h1" className="deborah-hero__title" text={title} delay={900} stagger={28} />
          <TextReveal as="p" className="deborah-hero__description" text={descText} delay={1300} stagger={12} />
          <div className="deborah-hero__actions">
            <Button variant="primary" size="lg" onClick={onGetStarted}>
              Get started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DeborahFooter({ year = new Date().getFullYear() }: { year?: number }) {
  return (
    <footer className="deborah-footer">
      <p className="deborah-footer__copyright">© {year} Oracle Clinician. All rights reserved.</p>
    </footer>
  );
}

export default function DeborahLanding({
  navigation = defaultNavigation,
  activeHref = '#',
  homeHref = '#',
  portraitSrc,
  backgroundSrc = treeBackground,
  title,
  description,
  eyebrow,
  showFooter = true,
  className = '',
  onGetStarted,
  onLogin,
}: {
  navigation?: NavLink[];
  activeHref?: string;
  homeHref?: string;
  portraitSrc?: Asset;
  backgroundSrc?: Asset;
  title?: string;
  description?: string;
  eyebrow?: string;
  showFooter?: boolean;
  className?: string;
  onGetStarted?: () => void;
  onLogin?: () => void;
}) {
  const mainId = useId();
  return (
    <div className={`deborah-page ${className}`.trim()}>
      <a className="deborah-skip-link" href={`#${mainId}`}>
        Skip to content
      </a>
      <DeborahNavbar
        links={navigation}
        activeHref={activeHref}
        homeHref={homeHref}
        onGetStarted={onGetStarted}
        onLogin={onLogin}
      />
      <main id={mainId} tabIndex={-1}>
        <DeborahHero
          title={title}
          description={description}
          eyebrow={eyebrow}
          portraitSrc={portraitSrc}
          backgroundSrc={backgroundSrc}
          onGetStarted={onGetStarted}
        />
      </main>
      {showFooter && <DeborahFooter />}
    </div>
  );
}
