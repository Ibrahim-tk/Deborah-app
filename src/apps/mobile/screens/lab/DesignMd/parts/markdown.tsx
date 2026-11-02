/**
 * Tiny Markdown renderer for DESIGN.md — headings, paragraphs, lists, tables, inline code, bold, italic.
 * Just enough for our own file; no dependency. Hex values inside inline code get a colour swatch.
 */
import type { CSSProperties, ReactNode } from 'react';
import styles from '../DesignMd.module.css';

export interface Heading { id: string; text: string; level: 2 | 3 }

const HEX = /^#[0-9a-f]{3,8}$/i;
export const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Drops the YAML front matter; the page renders the prose body only. */
export const stripFrontMatter = (src: string) => (src.startsWith('---') ? src.slice(src.indexOf('\n---', 3) + 4) : src).trim();

function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${key}-${m.index}`;
    if (tok.startsWith('`')) {
      const code = tok.slice(1, -1);
      out.push(
        <code key={k} className={styles.code}>
          {HEX.test(code) && <span className={styles.swatch} style={{ '--sw': code } as CSSProperties} aria-hidden />}
          {code}
        </code>,
      );
    } else if (tok.startsWith('**')) out.push(<strong key={k}>{inline(tok.slice(2, -2), m.index)}</strong>);
    else out.push(<em key={k}>{inline(tok.slice(1, -1), m.index)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (row: string) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** Renders the body; the first H1 is skipped (the page draws its own hero). */
export function renderMarkdown(src: string): { nodes: ReactNode[]; headings: Heading[] } {
  const lines = src.split('\n');
  const nodes: ReactNode[] = [];
  const headings: Heading[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const k = `b${i}`;
    if (!line.trim()) { i++; continue; }
    const h = /^(#{1,3}) (.+)$/.exec(line);
    if (h) {
      const level = h[1].length;
      if (level > 1) {
        const id = slug(h[2]);
        headings.push({ id, text: h[2], level: level as 2 | 3 });
        const Tag = level === 2 ? 'h2' : 'h3';
        nodes.push(<Tag key={k} id={id} className={level === 2 ? styles.h2 : styles.h3}>{h[2]}</Tag>);
      }
      i++;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const [head, , ...body] = rows;
      nodes.push(
        <div key={k} className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>{cells(head).map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
            <tbody>{body.map((r, ri) => <tr key={ri}>{cells(r).map((c, j) => <td key={j}>{inline(c, ri * 100 + j)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) items.push(lines[i++].slice(2));
      nodes.push(<ul key={k} className={styles.list}>{items.map((t, j) => <li key={j}>{inline(t, j)}</li>)}</ul>);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|\||- )/.test(lines[i])) para.push(lines[i++]);
    nodes.push(<p key={k} className={styles.p}>{inline(para.join(' '))}</p>);
  }
  return { nodes, headings };
}
