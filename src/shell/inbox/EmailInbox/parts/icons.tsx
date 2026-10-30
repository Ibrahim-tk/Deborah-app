/** Inline mail-client icons (prototype chrome only; 24px, stroke = currentColor). */
const P: Record<string, string> = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  chat: 'M5 5h14v10H9l-4 4z',
  video: 'M4 7h11v10H4zM15 11l5-3v8l-5-3',
  pencil: 'M5 19l1-4L16 5l3 3L9 18zM14 7l3 3',
  inbox: 'M4 5h16v14H4zM4 13h5l1 2h4l1-2h5',
  star: 'M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.6 7.1 19.2 8 13.7 4 9.8 9.5 9z',
  clock: 'M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4l3 2',
  send: 'M4 12l16-7-6 16-3-7z',
  file: 'M7 4h7l4 4v12H7zM14 4v4h4',
  label: 'M4 7h11l5 5-5 5H4z',
  chevronDown: 'M7 10l5 5 5-5',
  chevronRight: 'M10 7l5 5-5 5',
  chevronLeft: 'M14 7l-5 5 5 5',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 5a6 6 0 100 12 6 6 0 000-12zM20 20l-4.5-4.5',
  tune: 'M4 7h10M18 7h2M4 17h4M12 17h8M14 5v4M8 15v4',
  help: 'M12 4a8 8 0 100 16 8 8 0 000-16zM9.5 10a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 3.5M12 17h.01',
  gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',
  spark: 'M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z',
  apps: 'M5 5h2v2H5zM11 5h2v2h-2zM17 5h2v2h-2zM5 11h2v2H5zM11 11h2v2h-2zM17 11h2v2h-2zM5 17h2v2H5zM11 17h2v2h-2zM17 17h2v2h-2z',
  refresh: 'M19 12a7 7 0 11-2-5M19 4v4h-4',
  more: 'M12 6h.01M12 12h.01M12 18h.01',
  back: 'M19 12H5M11 6l-6 6 6 6',
  archive: 'M4 5h16v4H4zM5 9v10h14V9M10 13h4',
  trash: 'M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13',
  calendar: 'M5 6h14v14H5zM5 10h14M9 4v4M15 4v4',
  keyboard: 'M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M8 14h8',
  reply: 'M10 8L5 12l5 4M5 12h9a5 5 0 015 5',
};

export function MailIcon({ name, size = 20, className }: { name: keyof typeof P; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={P[name]} />
    </svg>
  );
}

/** Neutral stand-in logo (no real product branding). */
export function MailLogo() {
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true">
      <rect x="1" y="1" width="28" height="20" rx="3" fill="none" stroke="#5f6368" strokeWidth="2" />
      <path d="M2 3l13 10L28 3" fill="none" stroke="#0a66d8" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

/** Your Oracle mark (same as the favicon): deep purple disc, gold serif O. */
export function OracleMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="16" fill="#291832" />
      <text x="16" y="22.5" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="20" fill="#e6c776">O</text>
    </svg>
  );
}
