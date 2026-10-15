/**
 * Decorative line illustration per answer section: a small medallion glyph beside the title and a large
 * faint echo of the same motif bleeding off the card's right edge. Purely visual (aria-hidden), static.
 */
import type { SectionKey } from '@flow-v1/shared/types/domain';
import styles from './AnswerSections.module.css';

const ART: Record<SectionKey, JSX.Element> = {
  // §1 We hear you: a speech bubble with listening arcs.
  hearing: (
    <>
      <path d="M14 20h22a6 6 0 0 1 6 6v10a6 6 0 0 1-6 6H24l-8 6v-6h-2a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6Z" />
      <path d="M48 22a12 12 0 0 1 0 18M53 17a19 19 0 0 1 0 28" />
      <circle cx="18" cy="31" r="1.6" fill="currentColor" /><circle cx="25" cy="31" r="1.6" fill="currentColor" /><circle cx="32" cy="31" r="1.6" fill="currentColor" />
    </>
  ),
  // §2 Hypothalamic lens: a central hub with six axes radiating to the glands.
  hypothalamic: (
    <>
      <circle cx="32" cy="32" r="7" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        const x1 = 32 + Math.cos(r) * 7, y1 = 32 + Math.sin(r) * 7;
        const x2 = 32 + Math.cos(r) * 21, y2 = 32 + Math.sin(r) * 21;
        return <g key={a}><path d={`M${x1} ${y1}L${x2} ${y2}`} /><circle cx={32 + Math.cos(r) * 25} cy={32 + Math.sin(r) * 25} r="4" /></g>;
      })}
      <circle cx="32" cy="32" r="2.4" fill="currentColor" />
    </>
  ),
  // §3 What it may mean: a constellation joining scattered signals.
  mayMean: (
    <>
      <path d="M10 44 22 26l14 10 10-20 10 14" />
      {[[10, 44], [22, 26], [36, 36], [46, 16], [56, 30]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.4" fill="currentColor" />)}
      <path d="M8 54h48" strokeDasharray="2 5" />
    </>
  ),
  // §4 Questions for your provider: two overlapping bubbles, one asking.
  providerQuestions: (
    <>
      <rect x="6" y="12" width="32" height="24" rx="8" />
      <path d="M26 30h24a8 8 0 0 1 8 8v8a8 8 0 0 1-8 8h-2v6l-8-6H34a8 8 0 0 1-8-8" />
      <path d="M18 20a4 4 0 1 1 5 4c-1 .4-1 1.2-1 2.2" /><circle cx="22" cy="31" r="1.4" fill="currentColor" />
    </>
  ),
  // §5 Tests to consider: a flask with rising bubbles.
  tests: (
    <>
      <path d="M26 8h12M28 8v16L14 50a4 4 0 0 0 3.5 6h29a4 4 0 0 0 3.5-6L36 24V8" />
      <path d="M19 42h26" />
      <circle cx="28" cy="49" r="2.4" fill="currentColor" /><circle cx="36" cy="46" r="1.6" fill="currentColor" /><circle cx="33" cy="36" r="1.4" />
    </>
  ),
  // §6 What you can do now: a sprout unfolding from the soil.
  doNow: (
    <>
      <path d="M32 56V30" />
      <path d="M32 36c0-10-8-16-18-16 0 10 8 16 18 16Z" />
      <path d="M32 30c0-10 7-17 18-17 0 11-7 17-18 17Z" />
      <path d="M16 56h32" />
    </>
  ),
  // §7 Deborah's word: a crescent moon among stars.
  word: (
    <>
      <path d="M40 12a20 20 0 1 0 12 32A16 16 0 0 1 40 12Z" />
      <path d="M48 10v6M45 13h6M54 26v4M52 28h4M14 14v4M12 16h4" />
    </>
  ),
};

function Glyph({ k, className }: { k: SectionKey; className: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {ART[k]}
    </svg>
  );
}

/** Small medallion shown in the header. */
export function SectionBadge({ k }: { k: SectionKey }) {
  return <span className={styles.medallion}><Glyph k={k} className={styles.medallionArt} /></span>;
}

