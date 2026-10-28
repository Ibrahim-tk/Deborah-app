/**
 * @ui Lightbox — full-stage photo viewer (design 2026-10-27): dark backdrop, large image, caption and
 * counter on top, prev / next on the sides, thumbnail strip below. Esc closes; ← / → step through.
 */
import { useEffect } from 'react';
import { IconButton } from '../IconButton';
import { Overlay } from '../Overlay';
import styles from './Lightbox.module.css';

export interface LightboxItem {
  id: string;
  src: string;
  title: string;
  date?: string;
}

export function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: LightboxItem[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const many = items.length > 1;
  const step = (d: number) => onIndex((index + d + items.length) % items.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && many) step(1);
      else if (e.key === 'ArrowLeft' && many) step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!item) return null;

  return (
    <Overlay>
      <div className={styles.root} role="dialog" aria-modal="true" aria-label={item.title}>
        <div className={styles.backdrop} onClick={onClose} />
        <header className={styles.bar}>
          <div className={styles.meta}>
            <span className={styles.title}>{item.title}</span>
            {item.date && <span className={styles.date}>{item.date}</span>}
          </div>
          {many && <span className={styles.count}>{`${index + 1} / ${items.length}`}</span>}
          <IconButton
            icon="close"
            label="Close"
            tone="plain"
            className={styles.btn}
            onClick={onClose}
          />
        </header>
        <div className={styles.stage}>
          {many && (
            <IconButton
              icon="back"
              label="Previous image"
              className={`${styles.btn} ${styles.nav}`}
              onClick={() => step(-1)}
            />
          )}
          <img
            key={item.id}
            src={item.src}
            alt={item.title}
            className={styles.img}
            draggable={false}
          />
          {many && (
            <IconButton
              icon="chevron"
              label="Next image"
              className={`${styles.btn} ${styles.nav}`}
              onClick={() => step(1)}
            />
          )}
        </div>
        {many && (
          <ul className={styles.strip} aria-label="All images">
            {items.map((x, i) => (
              <li key={x.id}>
                <button
                  type="button"
                  className={styles.thumb}
                  aria-current={i === index || undefined}
                  aria-label={x.title}
                  onClick={() => onIndex(i)}
                >
                  <img src={x.src} alt="" draggable={false} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Overlay>
  );
}
