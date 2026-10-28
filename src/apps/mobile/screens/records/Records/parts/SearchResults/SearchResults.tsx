/**
 * Records search results, drawn inside the search dropdown (design direction 2026-10-20): compact rows for
 * visit notes (lab reports removed 2026-10-28). Matching is plain text, case-insensitive, over titles and
 * note bodies. Tapping anything closes search and opens it.
 */
import { useShallow } from 'zustand/react/shallow';
import { selectProfileNotes, useAppStore } from '@shared/store';
import type { Note } from '@shared/types/domain';
import { Icon } from '@mobile/ui';
import { EmptyState } from '@mobile/patterns/health';
import { useNav } from '@mobile/navigation';
import styles from './SearchResults.module.css';

const dateFor = (n: Note) =>
  new Date(n.brief?.appointmentDate ?? n.visitLog?.visitDate ?? n.updatedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export interface SearchResultsProps {
  query: string;
  profileId: string;
  onPick: () => void;
  /** `list`: the dropdown — a few rows, then "See all". `full`: the expanded page with every match. */
  variant?: 'list' | 'full';
  onSeeAll?: () => void;
}

const LIST_MAX = 3;

export function SearchResults({ query, profileId, onPick, variant = 'full', onSeeAll }: SearchResultsProps) {
  const list = variant === 'list';
  const { open: go } = useNav();
  const open = (id: string, params: Record<string, string>) => { onPick(); go(id, params); };
  const notes = useAppStore(useShallow((s) => selectProfileNotes(s, profileId)));
  const q = query.trim().toLowerCase();
  const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(q));

  const allNotes = notes.filter((n) => has(n.title, n.body, n.visitLog?.diagnosis));
  const foundNotes = list ? allNotes.slice(0, LIST_MAX) : allNotes;
  const total = allNotes.length;

  if (!foundNotes.length) {
    return <EmptyState icon="search" title={`Nothing for “${query.trim()}”`} text="Try a word from a note." />;
  }

  return (
    <div className={styles.root}>
      {foundNotes.length > 0 && (
        <section className={styles.section} aria-labelledby="search-notes">
          <h2 id="search-notes" className={styles.heading}>Visit Notes</h2>
          {foundNotes.map((n) => (
            <button key={n.id} type="button" className={styles.row} onClick={() => (n.kind === 'provider-brief' ? open('M-9.7', { noteId: n.id }) : n.visit ? open('M-9.8', { noteId: n.id }) : open('M-9.4', { noteId: n.id }))}>
              <span className={styles.rowIcon}><Icon name="note" size={20} /></span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{n.title || 'Untitled note'}</span>
                <span className={styles.rowSub}>{dateFor(n)} · {n.visitLog ? 'Visit logged' : 'Not logged yet'}</span>
              </span>
              <Icon name="chevron" size={16} className={styles.chevron} />
            </button>
          ))}
        </section>
      )}
      {list && onSeeAll && (
        <button type="button" className={styles.seeAll} onClick={onSeeAll}>
          <Icon name="search" size={18} />
          <span>See all {total > 1 ? `${total} results` : 'results'} for “{query.trim()}”</span>
        </button>
      )}
    </div>
  );
}
