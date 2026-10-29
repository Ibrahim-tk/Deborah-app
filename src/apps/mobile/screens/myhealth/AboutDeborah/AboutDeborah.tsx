/**
 * @screen  M-7.6 · About Oracle
 * @flow    F07 My Health hub
 * @states  default
 * @figma   https://www.figma.com/design/PoXOGNXuOaq3xIEnBpBT7f/Genesis?node-id=52-280
 * @spec    docs/ux/F07-my-health-hub.md#m-76--about-deborah
 * @xref    web: W-7.6 (apps/web/screens/myhealth/AboutDeborah) — not built
 */
// Oracle Change Requests (Oct 26): no portrait, books or credentials — Oracle is an AI system.
import { ABOUT_ORACLE } from '@shared/copy/aboutOracle';
import { FTC_OWNERSHIP_STATEMENT } from '@shared/copy/disclosures';
import { DeborahBlob, Header } from '@mobile/ui';
import { useNav, useRoute } from '@mobile/navigation';
import styles from './AboutDeborah.module.css';

export default function AboutDeborah() {
  const { pop } = useNav();
  const { previousTitle } = useRoute();

  return (
    <div className={styles.root} data-xref="M-7.6 · About the Oracle">
      <Header title="About the Oracle" onBack={pop} backLabel={previousTitle} />
      <div className={styles.scroll}>
        <div className={styles.body} data-placeholder>
          <div className={styles.intro}>
            <DeborahBlob size={120} label="Oracle" />
            <h2 className={styles.name}>Oracle</h2>
            <p className={styles.years}>{ABOUT_ORACLE.lede}</p>
          </div>
          {ABOUT_ORACLE.sections.map((sec) => (
            <section key={sec.title} className={styles.section}>
              <h3 className={styles.heading}>{sec.title}</h3>
              {sec.body.map((p) => <p key={p} className={styles.paragraph}>{p}</p>)}
            </section>
          ))}
          <section className={styles.section}>
            <h3 className={styles.heading}>Who makes Oracle</h3>
            <p className={styles.paragraph}>{FTC_OWNERSHIP_STATEMENT}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
