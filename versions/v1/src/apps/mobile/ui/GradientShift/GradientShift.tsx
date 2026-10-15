/**
 * @ui GradientShift — variation 2 backdrop: a slow-drifting violet / lilac / gold sky that melts
 * into parchment. Renders nothing visible unless <html data-variant="2"> (set by the shell).
 *
 * Performance: each colour field is its own layer that only animates `transform`, so the
 * compositor moves pre-rasterised gradients with no layout or repaint per frame. No `filter: blur`
 * on moving layers (the softness comes from the radial gradients' own falloff). Grain is one
 * static layer. Long durations (9–13 s) keep the GPU mostly idle; browsers pause CSS animation
 * in background tabs on their own.
 *
 * Reduced motion: the drift stops under prefers-reduced-motion and the shell's toggle
 * (html.reduced-motion); the sky keeps its resting composition, so nothing is lost.
 */
import styles from './GradientShift.module.css';

export function GradientShift() {
  return (
    <span className={styles.root} aria-hidden>
      <span className={`${styles.field} ${styles.violet}`} />
      <span className={`${styles.field} ${styles.lilac}`} />
      <span className={`${styles.field} ${styles.gold}`} />
      <span className={`${styles.field} ${styles.plum}`} />
      <span className={styles.veil} />
      <span className={styles.grain} />
    </span>
  );
}
