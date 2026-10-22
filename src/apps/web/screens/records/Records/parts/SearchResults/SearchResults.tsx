/**
 * Records search results, drawn inside the search dropdown (design direction 2026-10-20): matching lab values
 * as tiles (top 4, like the lab report), then compact rows for lab reports and visit notes. Matching is plain
 * text, case-insensitive, over titles, notes, lab names and markers. Tapping anything closes search and opens it.
 */
import { useShallow } from 'zustand/react/shallow';
import { selectProfileLabs, selectProfileNotes, useAppStore } from '@shared/store';
import type { Note } from '@shared/types/domain';
import { formatShortDate } from '@shared/utils';
import { Icon } from '@web/ui';
import { EmptyState } from '@web/patterns/health';
import { useNav } from '@web/navigation';
import styles from './SearchResults.module.css';

const dateFor = (n: Note) =>
  new Date(n.brief?.appointmentDate ?? n.visitLog?.visitDate ?? n.updatedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export interface SearchResultsProps {
  query: string;
  profileId: string;
  onPick: () => void;
  /** `list`: the dropdown — rows only, a few per kind, then "See all". `full`: the expanded page with tiles. */
  variant?: 'list' | 'full';
  onSeeAll?: () => void;
}

const LIST_MAX = 3;

export function SearchResults({ query, profileId, onPick, variant = 'full', onSeeAll }: SearchResultsProps) {
  const list = variant === 'list';
  const { open: go } = useNav();
  const open = (id: string, params: Record<string, string>) => { onPick(); go(id, params); };
  const notes = useAppStore(useShallow((s) => selectProfileNotes(s, profileId)));
  const labs = useAppStore(useShallow((s) => selectProfileLabs(s, profileId)));
  const q = query.trim().toLowerCase();
  const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(q));

  const allReports = labs.filter((r) => has(r.panelTitle, r.labName, ...r.values.map((v) => v.marker)));
  const allNotes = notes.filter((n) => has(n.title, n.body, n.visitLog?.diagnosis));
  const values = list ? [] : labs.flatMap((r) => r.values.filter((v) => has(v.marker, r.panelTitle, r.labName)).map((v) => ({ v, r }))).slice(0, 4);
  const reports = list ? allReports.slice(0, LIST_MAX) : allReports;
  const foundNotes = list ? allNotes.slice(0, LIST_MAX) : allNotes;
  const total = allReports.length + allNotes.length;

  if (!values.length && !reports.length && !foundNotes.length) {
    return <EmptyState icon="search" title={`Nothing for “${query.trim()}”`} text="Try a lab name like TSH, or a word from a note." />;
  }

  return (
    <div className={styles.root}>
      {(values.length > 0 || reports.length > 0) && (
        <section className={styles.section} aria-labelledby="search-labs">
          <h2 id="search-labs" className={styles.heading}>Labs</h2>
          {values.length > 0 && (
            <ul className={styles.grid}>
              {values.map(({ v, r }) => (
                <li key={`${r.id}-${v.id}`}>
                  <button type="button" className={styles.tile} onClick={() => open('M-9.5', { reportId: r.id })}>
                    <span className={styles.marker}>{v.marker}</span>
                    <span className={styles.reading}>
                      <span className={styles.value} data-words={!/\d/.test(v.value) || undefined}>{v.value}</span>
                      {v.unit.trim() && <span className={styles.unit}>{v.unit}</span>}
                    </span>
                    <span className={styles.meta}>{r.collectedAt ? formatShortDate(r.collectedAt) : r.panelTitle}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {reports.map((r) => (
            <button key={r.id} type="button" className={styles.row} onClick={() => open('M-9.5', { reportId: r.id })}>
              <span className={styles.rowIcon}><Icon name="labs" size={20} /></span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{r.panelTitle || r.labName || 'Lab results'}</span>
                <span className={styles.rowSub}>{[r.collectedAt && formatShortDate(r.collectedAt), `${r.values.length} values`].filter(Boolean).join(' · ')}</span>
              </span>
              <Icon name="chevron" size={16} className={styles.chevron} />
            </button>
          ))}
        </section>
      )}
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
