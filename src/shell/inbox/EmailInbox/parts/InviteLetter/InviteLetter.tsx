/** @shell InviteLetter — the teen invitation email body in Your Oracle branding (story 1.5). No health information. */
import { teenAccountCopy as copy } from '@shared/data';
import styles from './InviteLetter.module.css';

/** Same logo as the web sidebar. */
const LOGO_SRC = '/images/splash/tree-of-life.svg';

export interface InviteLetterProps {
  onFinish: () => void;
  onFinishWeb: () => void;
}

export function InviteLetter({ onFinish, onFinishWeb }: InviteLetterProps) {
  return (
    <div className={styles.backdrop}>
    <div className={styles.letter} data-placeholder>
      <img src={LOGO_SRC} alt="Your Oracle" className={styles.logo} width={72} height={72} />
      <div className={styles.body}>
        <h2 className={styles.title}>{copy.email.subject}</h2>
        <span className={styles.rule} aria-hidden="true" />
        {copy.email.body.map((t) => <p key={t} className={styles.text}>{t}</p>)}
        <button type="button" className={styles.cta} onClick={onFinish}>{copy.email.cta}</button>
        <button type="button" className={styles.alt} onClick={onFinishWeb}>Open on desktop web instead</button>
        <p className={styles.note}>This link is unique to your parent’s Family Plan and can only be used once. If you weren’t expecting it, you can ignore this email.</p>
      </div>
      <div className={styles.foot}>
        <p>Your Oracle · Health education, by Genesis Health Products</p>
        <p>You’re receiving this because a parent or guardian invited you.</p>
      </div>
    </div>
    </div>
  );
}
