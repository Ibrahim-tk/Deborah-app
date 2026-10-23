'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import treeBackground from './assets/deborah-tree.webp';
import referenceSprite from './assets/reference-sprite.webp';
import './DeborahLanding.css';

export const defaultNavigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Services', href: '/services' },
  { label: 'Resources', href: '/resources' },
];

// Some frameworks import images as metadata objects rather than URL strings.
const assetUrl = (asset) => typeof asset === 'string' ? asset : asset?.src;

const referenceDescription = 'I’ve spent thirty years helping women make sense of what their bodies are telling them, and I’d love to listen to you too.';
const referenceLines = ['I’ve spent thirty years helping women ', 'make sense of what their bodies are ', 'telling them, and I’d love to listen ', 'to you too.'];

const defaultFooterLinks = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
];

function Arrow() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h15m-6-7 7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/** Uses the supplied reference without redrawing the original flower mark. */
function Brand({ homeHref = '/', logoSrc, compact = false }) {
  return (
    <a className={`deborah-brand${compact ? ' deborah-brand--small' : ''}`} href={homeHref} aria-label="Deborah home">
      {logoSrc ? <img className="deborah-brand__custom" src={assetUrl(logoSrc)} alt="" /> : (
        <span className="deborah-brand__mark" aria-hidden="true" style={{ backgroundImage: `url("${assetUrl(referenceSprite)}")` }} />
      )}
      <span>Deborah</span>
    </a>
  );
}

/** A disclosure menu: native links, keyboard access, Escape and outside-click dismissal. */
export function DeborahNavbar({
  links = defaultNavigation,
  activeHref = '/',
  homeHref = '/',
  loginHref = '/login',
  getStartedHref = '/get-started',
  logoSrc,
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const headerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 1100px)');
    const closeOnDesktop = (event) => { if (event.matches) setOpen(false); };
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
      <div className="deborah-header__inner">
        <Brand homeHref={homeHref} logoSrc={logoSrc} />
        <button ref={toggleRef} className="deborah-menu-toggle" type="button" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen(!open)}>
          <span>{open ? 'Close' : 'Menu'}</span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={open ? 'm6 6 12 12M6 18 18 6' : 'M4 7h16M4 12h16M4 17h16'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <nav id={menuId} className="deborah-navigation" aria-label="Main navigation" data-open={open} onClick={(event) => { if (event.target.closest('a')) setOpen(false); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget) && !toggleRef.current?.contains(event.relatedTarget)) setOpen(false); }}>
          <ul className="deborah-navigation__links">
            {links.map(({ label, href }) => <li key={`${label}-${href}`}><a href={href} aria-current={href === activeHref ? 'page' : undefined}>{label}</a></li>)}
          </ul>
          <div className="deborah-navigation__actions">
            <a className="deborah-login" href={loginHref}>Log in</a>
            <a className="deborah-button" href={getStartedHref}>Get started</a>
          </div>
        </nav>
      </div>
    </header>
  );
}

export function DeborahHero({
  title = 'Hello, I’m Deborah.',
  description = referenceDescription,
  eyebrow = 'Women’s health & wellness',
  getStartedHref = '/get-started',
  learnMoreHref = '/about',
  backgroundSrc = treeBackground,
  portraitSrc,
  portraitAlt = 'Deborah',
}) {
  const headingId = useId();
  return (
    <section className="deborah-hero" aria-labelledby={headingId}>
      <img className="deborah-hero__landscape" src={assetUrl(backgroundSrc)} alt="" fetchPriority="high" decoding="async" />
      <div className="deborah-hero__wash" aria-hidden="true" />
      <div className="deborah-hero__inner">
        <div className="deborah-hero__content">
          {portraitSrc ? <img className="deborah-portrait" src={assetUrl(portraitSrc)} width="96" height="96" alt={portraitAlt} /> : <span className="deborah-portrait deborah-portrait--reference" role="img" aria-label={portraitAlt} style={{ backgroundImage: `url("${assetUrl(referenceSprite)}")` }} />}
          {eyebrow && <p className="deborah-eyebrow">{eyebrow}</p>}
          <h1 id={headingId}>{title}</h1>
          <p className="deborah-hero__description">{description === referenceDescription ? referenceLines.map((line) => <span className="deborah-reference-line" key={line}>{line}</span>) : description}</p>
          <div className="deborah-hero__actions">
            <a className="deborah-button deborah-button--hero" href={getStartedHref}>Get started <Arrow /></a>
            <a className="deborah-text-link" href={learnMoreHref}>Learn more</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Can be imported independently on every page. */
export function DeborahFooter({ homeHref = '/', logoSrc, links = defaultFooterLinks, year = new Date().getFullYear() }) {
  return (
    <footer className="deborah-footer">
      <div className="deborah-footer__inner">
        <Brand homeHref={homeHref} logoSrc={logoSrc} compact />
        <p className="deborah-footer__copyright">© {year} Deborah. All rights reserved.</p>
        <nav aria-label="Footer navigation"><ul>{links.map(({ label, href }) => <li key={`${label}-${href}`}><a href={href}>{label}</a></li>)}</ul></nav>
      </div>
    </footer>
  );
}

/** Drop-in complete page. Each part is also a named export for existing layouts. */
export default function DeborahLanding({
  navigation = defaultNavigation,
  activeHref = '/',
  homeHref = '/',
  loginHref = '/login',
  getStartedHref = '/get-started',
  learnMoreHref = '/about',
  footerLinks = defaultFooterLinks,
  logoSrc,
  portraitSrc,
  backgroundSrc = treeBackground,
  title,
  description,
  eyebrow,
  showFooter = true,
  className = '',
}) {
  const mainId = useId();
  return (
    <div className={`deborah-page ${className}`}>
      <a className="deborah-skip-link" href={`#${mainId}`}>Skip to content</a>
      <DeborahNavbar links={navigation} activeHref={activeHref} homeHref={homeHref} loginHref={loginHref} getStartedHref={getStartedHref} logoSrc={logoSrc} />
      <main id={mainId} tabIndex={-1}>
        <DeborahHero title={title} description={description} eyebrow={eyebrow} getStartedHref={getStartedHref} learnMoreHref={learnMoreHref} portraitSrc={portraitSrc} backgroundSrc={backgroundSrc} />
      </main>
      {showFooter && <DeborahFooter homeHref={homeHref} logoSrc={logoSrc} links={footerLinks} />}
    </div>
  );
}
