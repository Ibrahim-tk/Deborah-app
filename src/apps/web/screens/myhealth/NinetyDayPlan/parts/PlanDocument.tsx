/**
 * Healing plan — one living list, then Deborah's letter.
 * Newest concern and its medicine box lead. Clinical summary, pillars, and resources stay underneath.
 */
import { useState } from 'react';
import { findProduct, healingPlanDocument } from '@shared/data';
import type { PlanConcern } from '@shared/types/domain';
import { DeborahBlob, Icon, ListRow, Panel } from '@web/ui';
import { LivingPlan } from './LivingPlan';
import styles from './PlanDocument.module.css';

export interface PlanDocumentProps {
  patientName: string;
  advocate: boolean;
  concerns: PlanConcern[];
  careTeam?: string;
  hasMedicines: boolean;
  onToggle: (concernId: string, actionId: string) => void;
  onResolve: (concernId: string) => void;
  onCheckInteractions: () => void;
  onShopProduct: (productId: string) => void;
  onOpenExternal: (url: string, title: string) => void;
}

const doc = healingPlanDocument;

export function PlanDocument({
  patientName,
  advocate,
  concerns,
  careTeam,
  hasMedicines,
  onToggle,
  onResolve,
  onCheckInteractions,
  onShopProduct,
  onOpenExternal,
}: PlanDocumentProps) {
  const [openPillar, setOpenPillar] = useState<string>('1');
  const newest = concerns.find((c) => c.status === 'active');
  const dietIsOpen = newest?.actions.some((a) => a.text.toLowerCase().includes('lean body mass'));
  const clinical = doc.clinical.items.map((item) =>
    item.label === 'Care Team' && careTeam ? { ...item, value: careTeam } : item,
  );

  return (
    <article className={styles.doc} data-placeholder={doc.status === 'placeholder' || undefined} aria-label={`Healing Plan for ${patientName}`}>
      <header className={styles.hero}>
        <DeborahBlob size={72} label="Oracle" />
        <div className={styles.heroCopy}>
          <h1 className={styles.title}>
            Healing Plan
            <span className={styles.forWhom}>for {patientName}</span>
          </h1>
          {advocate && <p className={styles.advocate}>You’re looking after {patientName}.</p>}
          <p className={styles.meta}>
            {doc.preparedBy}
            <span aria-hidden> · </span>
            {doc.dateLabel}
          </p>
          <p className={styles.reference}>Deborah answers from this plan and your history.</p>
        </div>
      </header>

      <LivingPlan
        concerns={concerns}
        careTeam={careTeam ?? ''}
        hasMedicines={hasMedicines}
        onToggle={onToggle}
        onResolve={onResolve}
        onCheckInteractions={onCheckInteractions}
      />

      <section className={styles.clinical} aria-labelledby="clinical-title">
        <h2 id="clinical-title" className={styles.h2}>{doc.clinical.title}</h2>
        <dl className={styles.clinicalGrid}>
          {clinical.map((item) => (
            <div key={item.label} className={styles.clinicalItem}>
              <dt className={styles.clinicalLabel}>{item.label}</dt>
              <dd className={styles.clinicalValue}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!dietIsOpen && (
        <Panel tone="linen" icon="info" goldRule>
          <p className={styles.calloutTitle}>{doc.callout.title}</p>
          <p className={styles.calloutBody}>{doc.callout.body}</p>
        </Panel>
      )}

      <section className={styles.pillarsBlock} aria-labelledby="pillars-title">
        <h2 id="pillars-title" className={styles.h2Wide}>{doc.pillarsIntro.title}</h2>
        <p className={styles.pillarsLede}>{doc.pillarsIntro.eyebrow}</p>

        <div className={styles.pillars}>
          {doc.pillars.map((p, i) => {
            const open = openPillar === p.id;
            return (
              <div key={p.id} className={styles.pillar} data-open={open || undefined}>
                <button
                  type="button"
                  className={styles.pillarHead}
                  aria-expanded={open}
                  onClick={() => setOpenPillar(open ? '' : p.id)}
                >
                  <span className={styles.pillarRoman}>{i + 1}</span>
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
    </article>
  );
}
