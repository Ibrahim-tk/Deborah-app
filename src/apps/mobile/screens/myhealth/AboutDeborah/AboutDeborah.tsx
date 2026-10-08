/**
 * @screen  M-7.6 · About Deborah
 * @flow    F07 My Health hub
 * @states  default
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-76--about-deborah
 * @xref    web: W-7.6 (apps/web/screens/myhealth/AboutDeborah) — not built
 */
// OPEN: "real photography, approved bio." — portrait and copy come from persona JSON (placeholder).
import { persona } from '@shared/data';
import { DeborahBlob, Button, Header } from '@mobile/ui';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './AboutDeborah.module.css';

export default function AboutDeborah() {
  const { pop, push } = useNav();
  const { previousTitle } = useRoute();
  const placeholder = persona.status === 'placeholder' || undefined;

  return (
    <div className={styles.root} data-xref="M-7.6 · About Deborah">
      <Header title="About Deborah" onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        <div className={styles.body} data-placeholder={placeholder} data-status={persona.status}>
          <div className={styles.intro}>
            <DeborahBlob size={120} label={`Portrait of ${persona.name}`} />
            <h2 className={styles.name}>{persona.credentialsLine}</h2>
            <p className={styles.years}>{persona.yearsPractice}+ years in practice</p>
          </div>

          <section className={styles.section} aria-labelledby="about-philosophy">
            <h3 id="about-philosophy" className={styles.heading}>How Deborah works</h3>
            {persona.philosophy.map((p) => (
              <p key={p} className={styles.paragraph}>{p}</p>
            ))}
          </section>

          <section className={styles.section} aria-labelledby="about-books">
            <h3 id="about-books" className={styles.heading}>Books</h3>
            <ul className={styles.books}>
              {persona.books.map((b) => (
                <li key={b.title} className={styles.book}>
                  <span className={styles.bookTitle}>{b.title}</span>
                  <span className={styles.bookMeta}>{b.year} · {b.note}</span>
                </li>
              ))}
            </ul>
          </section>

          <Button fullWidth leadingIcon="calendar" onClick={() => push('M-8.2')}>
            Book a consultation with Deborah
          </Button>
        </div>
      </div>
    </div>
  );
}
