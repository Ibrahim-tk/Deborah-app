/**
 * @screen  LAB · DESIGN.md (route /internal/design-md) — not a product screen
 * @flow    — design tool
 * @states  rendered (default) · source
 * @xref    web: — not built
 *
 * Reads /DESIGN.md at build time and renders it with the app's own tokens: contents rail,
 * Rendered / Source toggle and Copy markdown. The file is the source; this page only displays it.
 */
import { useMemo, useState } from 'react';
import { cx } from '@shared/utils';
import { designPath, goInternal } from '@shared/utils/internalPaths';
import source from '/DESIGN.md?raw';
import { renderMarkdown, stripFrontMatter } from './parts/markdown';
import styles from './DesignMd.module.css';

const LINES = source.split('\n').length;

export default function DesignMd() {
  const [view, setView] = useState<'rendered' | 'source'>('rendered');
  const [copied, setCopied] = useState(false);
  const body = useMemo(() => stripFrontMatter(source), []);
  const { nodes, headings } = useMemo(() => renderMarkdown(body), [body]);
  const lede = body.split('\n').find((l) => l.trim() && !l.startsWith('#'));

  const copy = () => {
    void navigator.clipboard?.writeText(source).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  };
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className={styles.root} data-xref="LAB · DESIGN.md">
      <header className={styles.bar}>
        <p className={styles.crumb}>Your Oracle <span aria-hidden>/</span> <strong>DESIGN.md</strong> <span className={styles.lines}>{LINES} lines</span></p>
        <div className={styles.actions}>
          <div className={styles.toggle} role="tablist" aria-label="View">
            {(['rendered', 'source'] as const).map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} className={cx(styles.toggleItem, view === v && styles.toggleOn)} onClick={() => setView(v)}>
                {v === 'rendered' ? 'Rendered' : 'Source'}
              </button>
            ))}
          </div>
          <button type="button" className={styles.copy} onClick={copy}>{copied ? 'Copied' : 'Copy markdown'}</button>
        </div>
      </header>

      <div className={styles.layout}>
        {view === 'rendered' && (
          <nav className={styles.toc} aria-label="Contents">
            <p className={styles.tocTitle}>Contents</p>
            {headings.filter((h) => h.level === 2).map((h) => (
              <button key={h.id} type="button" className={styles.tocItem} onClick={() => go(h.id)}>{h.text}</button>
            ))}
          </nav>
        )}
        <main className={styles.content}>
          {view === 'rendered' ? (
            <article className={styles.doc}>
              <p className={styles.eyebrow}>Your Oracle · Mobile app</p>
              <h1 className={styles.h1}>DESIGN<span className={styles.h1Accent}>.md</span></h1>
              {lede && <p className={styles.lede}>{lede}</p>}
              <p className={styles.refs}>
                Visual reference: <a href={designPath('design-system')} className={styles.link} onClick={(e) => { e.preventDefault(); goInternal(designPath('design-system')); }}>Live design system</a>
                <span className={styles.refSep}>Source of truth: <code className={styles.code}>src/styles</code></span>
              </p>
              {nodes.slice(1)}
            </article>
          ) : (
            <div className={styles.sourceBox}>
              {/* Zero-height sticky rail: the copy button stays top-right while the file scrolls. */}
              <div className={styles.sourceRail}>
                <button type="button" className={styles.sourceCopy} onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
              </div>
              <pre className={styles.source}>{source}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
