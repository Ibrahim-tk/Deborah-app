/** @shell InviteLetter — the teen invitation email body in Your Oracle branding (story 1.5). No health information. */
import { teenAccountCopy as copy } from '@shared/data';
import styles from './InviteLetter.module.css';

/** Same logo as the web sidebar. */
const LOGO_SRC = '/images/splash/tree-of-life.svg';

export interface InviteLetterProps {
  onFinish: () => void;
  onFinishWeb?: () => void;
  subject?: string;
  body?: readonly string[];
  cta?: string;
  note?: string;
  foot?: readonly string[];
  webLabel?: string;
}

export function InviteLetter({
  onFinish,
  onFinishWeb,
  subject = copy.email.subject,
  body = copy.email.body,
  cta = copy.email.cta,
  note = 'This link is unique to your parent’s Family Plan and can only be used once. If you weren’t expecting it, you can ignore this email.',
  foot = ['Your Oracle · Health education, by Genesis Health Products', 'You’re receiving this because a parent or guardian invited you.'],
  webLabel = 'Open on desktop web instead',
}: InviteLetterProps) {
  return (
    <div className={styles.backdrop}>
    <div className={styles.letter} data-placeholder>
      <img src={LOGO_SRC} alt="" className={styles.logo} width={72} height={72} />
      <div className={styles.body}>
        <h2 className={styles.title}>{subject}</h2>
        <span className={styles.rule} aria-hidden="true" />
        {body.map((t) => <p key={t} className={styles.text}>{t}</p>)}
        <button type="button" className={styles.cta} onClick={onFinish}>{cta}</button>
        {onFinishWeb && <button type="button" className={styles.alt} onClick={onFinishWeb}>{webLabel}</button>}
        <p className={styles.note}>{note}</p>
      </div>
      <div className={styles.foot}>
        {foot.map((line) => <p key={line}>{line}</p>)}
      </div>
    </div>
    </div>
  );
}
