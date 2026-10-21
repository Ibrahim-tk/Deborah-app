/**
 * Healing plan document — clinical structure as a calm Oracle reading surface.
 * Header · clinical summary · conditions · pillars · resources · signature.
 */
import { useState } from 'react';
import { findProduct, healingPlanDocument } from '@shared/data';
import type { IconName } from '@mobile/ui';
import { DeborahBlob, Icon, ListRow, Panel } from '@mobile/ui';
import styles from './PlanDocument.module.css';

export interface PlanDocumentProps {
  patientName: string;
  onShopProduct: (productId: string) => void;
  onOpenExternal: (url: string, title: string) => void;
}

const doc = healingPlanDocument;

export function PlanDocument({ patientName, onShopProduct, onOpenExternal }: PlanDocumentProps) {
  const [openPillar, setOpenPillar] = useState<string>('1');

  return (
    <article className={styles.doc} data-placeholder={doc.status === 'placeholder' || undefined} aria-label={`Healing Plan for ${patientName}`}>
      {/* —— Hero: Deborah present, literary title —— */}
      <header className={styles.hero}>
        <DeborahBlob size={72} label="Oracle" />
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            Healing Plan
            <span className={styles.forWhom}>for {patientName}</span>
          </h1>
          <p className={styles.meta}>
            {doc.preparedBy}
            <span aria-hidden> · </span>
            {doc.dateLabel}
          </p>
        </div>
      </header>

      {/* —— Clinical summary: one tonal field, not a bordered card stack —— */}
      <section className={styles.clinical} aria-labelledby="clinical-title">
        <h2 id="clinical-title" className={styles.h2}>{doc.clinical.title}</h2>
        <dl className={styles.clinicalGrid}>
          {doc.clinical.items.map((item) => (
            <div key={item.label} className={styles.clinicalItem}>
              <dt className={styles.clinicalLabel}>{item.label}</dt>
              <dd className={styles.clinicalValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* —— Immediate callout: gold rule = Deborah moment —— */}
      <Panel tone="linen" icon="info" goldRule>
        <p className={styles.calloutTitle}>{doc.callout.title}</p>
        <p className={styles.calloutBody}>{doc.callout.body}</p>
      </Panel>

      {/* —— Condition guidance (unboxed sections) —— */}
      <div className={styles.conditions}>
        {doc.conditions.map((c) => (
          <section key={c.id} className={styles.condition} aria-labelledby={`cond-${c.id}`}>
            <div className={styles.conditionHead}>
              <Icon name={c.icon as IconName} size={20} className={styles.conditionIcon} />
              <h2 id={`cond-${c.id}`} className={styles.h2}>{c.title}</h2>
            </div>
            <ul className={styles.recList}>
              {c.items.map((text) => (
                <li key={text} className={styles.recItem}>
                  <span className={styles.recMark} aria-hidden />
                  <span className={styles.recText}>{text}</span>
                </li>
              ))}
            </ul>
            {c.note && <p className={styles.recNote}>{c.note}</p>}
          </section>
        ))}
      </div>

      {/* —— Five pillars —— */}
      <section className={styles.pillarsBlock} aria-labelledby="pillars-title">
        <h2 id="pillars-title" className={styles.h2Wide}>{doc.pillarsIntro.title}</h2>
        <p className={styles.pillarsLede}>{doc.pillarsIntro.eyebrow}</p>

        <div className={styles.pillars}>
          {doc.pillars.map((p) => {
            const open = openPillar === p.id;
            return (
              <div key={p.id} className={styles.pillar} data-open={open || undefined}>
                <button
                  type="button"
                  className={styles.pillarHead}
                  aria-expanded={open}
                  onClick={() => setOpenPillar(open ? '' : p.id)}
                >
                  <span className={styles.pillarRoman}>{p.roman}</span>
                  <span className={styles.pillarText}>
                    <span className={styles.pillarName}>{p.name}</span>
                    <span className={styles.pillarTag}>{p.tag}</span>
                  </span>
                  <Icon name="chevronDown" size={18} className={styles.pillarChevron} />
                </button>
                {open && (
                  <div className={styles.pillarBody}>
                    {p.lede && <p className={styles.pillarIntro}>{p.lede}</p>}
                    {p.products?.map((prod) => {
                      const catalog = findProduct(prod.productId);
                      return (
                        <div key={prod.productId} className={styles.productRow}>
                          <ListRow
                            leading={
                              catalog?.image ? (
                                <img src={catalog.image} alt="" className={styles.productImg} />
                              ) : (
                                <span className={styles.productMark} aria-hidden>
                                  <Icon name="shop" size={18} />
                                </span>
                              )
                            }
                            title={prod.name}
                            subtitle={prod.dose}
                            onPress={() => onShopProduct(prod.productId)}
                          />
                        </div>
                      );
                    })}
                    {p.items.length > 0 && (
                      <ul className={styles.recList}>
                        {p.items.map((text) => (
                          <li key={text} className={styles.recItem}>
                            <span className={styles.recMark} aria-hidden />
                            <span className={styles.recText}>{text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* —— Resources —— */}
      <section className={styles.resources} aria-labelledby="resources-title">
        <h2 id="resources-title" className={styles.h2}>Your resources</h2>
        <div className={styles.resourceList}>
          {doc.resources.map((r) => (
            <ListRow
              key={r.href}
              title={r.label}
              trailing={<Icon name="external" size={18} />}
              onPress={() => onOpenExternal(r.href, r.label)}
            />
          ))}
        </div>
      </section>

      {/* —— Signature —— */}
      <footer className={styles.signature}>
        <p className={styles.signatureMark}>—</p>
        <p className={styles.signatureName}>{doc.signature.name}</p>
        <p className={styles.signatureTitle}>{doc.signature.title}</p>
      </footer>
    </article>
  );
}
