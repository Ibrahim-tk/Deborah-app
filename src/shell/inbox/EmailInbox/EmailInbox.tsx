/**
 * @shell EmailInbox — webmail look-alike holding the teen's invitation (story 1.5). Prototype chrome, not the app;
 *     fictional senders and a neutral logo. "Finish Sign Up" loads S28 and opens the teen setup on Mobile or Web.
 */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teenAccountCopy as copy } from '@shared/data';
import { clearSignup } from '@shared/store';
import { MailIcon, MailLogo, OracleMark } from './parts/icons';
import { InviteLetter } from './parts/InviteLetter';
import { INVITE_ID, MAILS } from './parts/mails';
import styles from './EmailInbox.module.css';

const TEEN_EMAIL = 'maya@icloud.com';
const TEEN_SCENARIO = 'S28';
const FOLDERS = [
  { icon: 'inbox', label: 'Inbox', count: '277', active: true },
  { icon: 'star', label: 'Starred' },
  { icon: 'clock', label: 'Snoozed' },
  { icon: 'send', label: 'Sent' },
  { icon: 'file', label: 'Drafts' },
  { icon: 'label', label: 'Categories' },
  { icon: 'chevronDown', label: 'More' },
] as const;

/** A second letter in the same inbox chrome (admin invite). The teen invitation stays the default. */
export interface WorkLetter {
  id: string;
  from: string;
  address: string;
  to: string;
  subject: string;
  preview: string;
  time: string;
  body: string[];
  cta: string;
  note: string;
  foot: string[];
  initial: string;
  onOpen: () => void;
}

export interface EmailInboxProps {
  /** Where the app routes live: `/` + `/web` (client) or `/internal/mobile` + `/internal/web`. */
  mobilePath: string;
  webPath: string;
  /** Standing admin invite (internal Email tab). The teen invitation stays in the list too. */
  letter?: WorkLetter | null;
  /** Open the admin letter on arrival (used by "Open invite link (prototype)"). */
  openLetter?: boolean;
}

type OpenMail = 'teen' | 'work' | null;

export function EmailInbox({ mobilePath, webPath, letter, openLetter = false }: EmailInboxProps) {
  const navigate = useNavigate();
  const focusKey = openLetter && letter ? letter.id : null;
  const [open, setOpen] = useState<OpenMail>(focusKey ? 'work' : null);
  const seen = useRef(focusKey);
  if (seen.current !== focusKey) {
    seen.current = focusKey;
    setOpen(focusKey ? 'work' : null);
  }
  const invite = MAILS[0];

  // A fresh S28 every time: drop any saved teen sign-up so the link always opens setup.
  const finish = (path: string) => {
    clearSignup();
    navigate(`${path}?scenario=${TEEN_SCENARIO}`);
  };

  return (
    <div className={styles.root} data-xref="Email · Teen invitation">
      <div className={styles.brand}>
        <span className={styles.icon}><MailIcon name="menu" size={22} /></span>
        <MailLogo />
        <span className={styles.brandName}>Mail</span>
      </div>
      <header className={styles.header}>
        <div className={styles.search} role="search">
          <span className={styles.icon}><MailIcon name="search" /></span>
          <span className={styles.searchText}>Search mail</span>
          <span className={styles.icon}><MailIcon name="tune" /></span>
        </div>
        <div className={styles.tools}>
          <span className={styles.status} aria-hidden="true" />
          <span className={styles.icon}><MailIcon name="chevronDown" size={16} /></span>
          <span className={styles.icon}><MailIcon name="help" /></span>
          <span className={styles.icon}><MailIcon name="gear" /></span>
          <span className={styles.icon}><MailIcon name="spark" /></span>
          <span className={styles.icon}><MailIcon name="apps" /></span>
          <span className={styles.org}>
            <span className={styles.orgName}>school</span>
            <span className={styles.avatar}>M</span>
          </span>
        </div>
      </header>

      <nav className={styles.rail} aria-label="Apps">
        <span className={styles.railItem} data-active>
          <span className={styles.railIcon}><MailIcon name="mail" /><span className={styles.badge}>99+</span></span>Mail
        </span>
        <span className={styles.railItem}><span className={styles.railIcon}><MailIcon name="chat" /></span>Chat</span>
        <span className={styles.railItem}><span className={styles.railIcon}><MailIcon name="video" /></span>Meet</span>
      </nav>

      <aside className={styles.side} aria-label="Folders">
        <button type="button" className={styles.compose}><MailIcon name="pencil" size={22} />Compose</button>
        {FOLDERS.map((f) => (
          <button key={f.label} type="button" className={styles.nav} data-active={'active' in f || undefined} onClick={() => setOpen(null)}>
            <MailIcon name={f.icon} />
            <span className={styles.navLabel}>{f.label}</span>
            {'count' in f && <span>{f.count}</span>}
          </button>
        ))}
        <div className={styles.labels}>Labels<span className={styles.icon}><MailIcon name="plus" /></span></div>
      </aside>

      <main className={styles.main}>
        {open ? (
          <>
            <div className={styles.toolbar}>
              <button type="button" className={styles.icon} aria-label="Back to Inbox" onClick={() => setOpen(null)}><MailIcon name="back" /></button>
              <span className={styles.icon}><MailIcon name="archive" /></span>
              <span className={styles.icon}><MailIcon name="trash" /></span>
              <span className={styles.icon}><MailIcon name="more" /></span>
            </div>
            <article className={styles.reader}>
              <h1 className={styles.readSubject}>{open === 'work' && letter ? letter.subject : invite.subject}</h1>
              <div className={styles.sender}>
                <OracleMark size={40} />
                <span className={styles.senderMeta}>
                  {open === 'work' && letter ? (
                    <>
                      <span className={styles.senderName}>{letter.from} <span className={styles.fine}>&lt;{letter.address}&gt;</span></span>
                      <span>to {letter.to}</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.senderName}>{copy.email.from} <span className={styles.fine}>&lt;invites@yourOracle.example&gt;</span></span>
                      <span>to {TEEN_EMAIL}</span>
                    </>
                  )}
                </span>
              </div>
              {open === 'work' && letter ? (
                <InviteLetter subject={letter.subject} body={letter.body} cta={letter.cta} note={letter.note} foot={letter.foot} onFinish={letter.onOpen} />
              ) : (
                <InviteLetter onFinish={() => finish(mobilePath)} onFinishWeb={() => finish(webPath)} />
              )}
            </article>
          </>
        ) : (
          <>
            <div className={styles.toolbar}>
              <span className={styles.icon}><span className={styles.check} /></span>
              <span className={styles.icon}><MailIcon name="refresh" /></span>
              <span className={styles.icon}><MailIcon name="more" /></span>
              <span className={styles.pager}>
                1–50 of 361
                <span className={styles.icon}><MailIcon name="chevronLeft" /></span>
                <span className={styles.icon}><MailIcon name="chevronRight" /></span>
                <span className={styles.icon}><MailIcon name="keyboard" /></span>
              </span>
            </div>
            <div className={styles.list} role="list" aria-label="Inbox">
              {letter && (
                <div
                  key={letter.id}
                  role="listitem"
                  tabIndex={0}
                  className={styles.row}
                  data-unread
                  onClick={() => setOpen('work')}
                  onKeyDown={(e) => { if (e.key === 'Enter') setOpen('work'); }}
                >
                  <span className={styles.check} />
                  <span className={styles.starred}><MailIcon name="star" size={18} /></span>
                  <span className={styles.from}>{letter.from}</span>
                  <span className={styles.subject}>
                    <span className={styles.subj}>{letter.subject}</span>
                    <span className={styles.preview}> - {letter.preview}</span>
                  </span>
                  <span className={styles.end}>
                    <span className={styles.time}>{letter.time}</span>
                  </span>
                </div>
              )}
              {MAILS.map((m) => {
                const isInvite = m.id === INVITE_ID;
                // Only the invite reads as new (bold) so it's easy to find in demos.
                const unread = isInvite;
                return (
                  <div
                    key={m.id}
                    role="listitem"
                    tabIndex={isInvite ? 0 : -1}
                    className={styles.row}
                    data-unread={unread || undefined}
                    data-read={!unread || undefined}
                    onClick={isInvite ? () => setOpen('teen') : undefined}
                    onKeyDown={isInvite ? (e) => { if (e.key === 'Enter') setOpen('teen'); } : undefined}
                  >
                    <span className={styles.check} />
                    <span className={styles.starred}><MailIcon name="star" size={18} /></span>
                    <span className={styles.from}>{m.from}{m.count && <span className={styles.count}>{m.count}</span>}</span>
                    <span className={styles.subject}>
                      <span className={styles.subj}>{m.subject}</span>
                      {m.preview && <span className={styles.preview}> - {m.preview}</span>}
                    </span>
                    <span className={styles.end}>
                      {m.calendar && <MailIcon name="calendar" size={18} />}
                      <span className={styles.time}>{m.time}</span>
                    </span>
                    {m.attachment && (
                      <span className={styles.chipRow}>
                        <span className={styles.chip}><span className={styles.chipIcon}>{m.attachment.endsWith('.pdf') ? 'PDF' : ''}</span>{m.attachment}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
