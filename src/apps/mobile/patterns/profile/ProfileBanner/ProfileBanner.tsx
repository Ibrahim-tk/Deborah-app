/**
 * @pattern ProfileBanner — slim "Asking for: Child (teen) · switch" row above the chat for non-self profiles
 * @usedBy  M-2.1
 * @spec    docs/ux/F06-family-profiles.md#m-21-state--chat-for-another-profile-figma-64
 * @xref    web: apps/web/patterns/profile/ProfileBanner — not built
 */
import styles from './ProfileBanner.module.css';

export interface ProfileBannerProps {
  /** Who the chat is about, e.g. "Child". */
  who: string;
  minor?: boolean;
  /** Under 13 reads "(child)"; otherwise a minor reads "(teen)". */
  child?: boolean;
  onSwitch: () => void;
}

export function ProfileBanner({ who, minor = false, child = false, onSwitch }: ProfileBannerProps) {
  return (
    <div className={styles.root} role="status">
      <p className={styles.text}>
        Asking for: <span className={styles.who}>{who}{minor && (child ? ' (child)' : ' (teen)')}</span>
      </p>
      <span className={styles.dot} aria-hidden="true">·</span>
      <button type="button" className={styles.switch} onClick={onSwitch}>
        switch
      </button>
    </div>
  );
}
