/** Sanitized inbox rows: fictional senders and subjects. Only `invite` is interactive. */
import { teenAccountCopy as copy } from '@shared/data';

export interface Mail {
  id: string;
  from: string;
  count?: number;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  attachment?: string;
  calendar?: boolean;
}

export const INVITE_ID = 'invite';

export const MAILS: Mail[] = [
  { id: INVITE_ID, from: copy.email.from, subject: copy.email.subject, preview: copy.email.body.join(' '), time: '4:52 PM', unread: true },
  { id: 'm1', from: 'Student Council', count: 2, subject: 'Action Required: Club Sign-up Survey', preview: 'Hi everyone, to help us plan this term’s activities, we request that you fill in …', time: '4:47 PM', unread: true },
  { id: 'm2', from: 'Study Group', count: 3, subject: 'A new comment in Biology Project', preview: 'Study Group left a comment for you on the board', time: '4:22 PM', unread: true },
  { id: 'm3', from: 'Sam Lee (via Docs)', subject: 'Document shared with you: "History Essay - Draft 2"', preview: 'Sam Lee shared a document with you (sam.lee@example.com) …', time: '3:52 PM', unread: true },
  { id: 'm4', from: 'Homework Hub', subject: '[Homework Hub] Your assignment on Algebra - Set 4 was created', preview: '[Homework Hub] Your assignment on Algebra - Set 4 was c…', time: '11:56 AM', unread: true },
  { id: 'm5', from: 'Jordan Park', subject: 'Updated invitation: Math Tutoring @ Fri Oct 30, 2026 3:30pm - 4pm', preview: 'Tutoring Center …', time: '10:01 AM', unread: true, calendar: true },
  { id: 'm6', from: 'The Whiteboard Team', subject: '⚡ New activity: 1 board needs your attention', preview: '', time: 'Oct 29', unread: true },
  { id: 'm7', from: 'Weekend Digest', subject: '[Weekly] Weekend Nearby Ideas', preview: 'Weekend picks — Sat 31 Oct & Sun 1 Nov. It’s looking sunny this weekend: around 24°…', time: 'Oct 29', unread: true },
  { id: 'm8', from: 'Notes App', subject: 'Recap of your study session', preview: 'Session purpose: review chapter 5 and plan next steps. Key takeaways - …', time: 'Oct 29', unread: true },
  { id: 'm9', from: 'CodeClub', subject: '[CodeClub] Email verification code', preview: 'Please verify your identity. Here is your verification code: 000000. This code is …', time: 'Oct 29' },
  { id: 'm10', from: 'Student Council', count: 2, subject: 'School Clubs Are Back! 🎉', preview: 'Register here: example.com/clubs. We look forward to seeing our clubs come alive again a…', time: 'Oct 29', unread: true, attachment: 'clubs_list.pdf' },
  { id: 'm11', from: 'School Newsletter', subject: 'Spooky week is here 🎃', preview: 'BOO! 👻 Hello everyone! 🎃 Halloween is here and obviously we planned something fun…', time: 'Oct 29', unread: true, attachment: 'halloween_flyer.png' },
  { id: 'm12', from: 'School Newsletter', subject: '🎃 Time to get SPOOKY!! 🎃', preview: 'BOO! 👻 Hello everyone! 🎃 Costume day is Friday, so dig out your best…', time: 'Oct 29', unread: true, attachment: 'costume_day.png' },
  { id: 'm13', from: 'Notes App', count: 2, subject: 'Alex wants to record your upcoming session', preview: 'Alex is using Notes App to record video calls and streamline note-taking proc…', time: 'Oct 29', unread: true },
  { id: 'm14', from: 'Coach Rivera', subject: 'Invitation: Soccer Practice @ Thu Oct 29, 2026 6:30pm - 8pm', preview: 'Team practice …', time: 'Oct 29', unread: true, calendar: true },
  { id: 'm15', from: 'Library', subject: 'Library Alert - Book Due Soon (12345678)', preview: 'Library Alert - Book Due Soon (12345678). Dear student, this is a system gene…', time: 'Oct 29', unread: true },
  { id: 'm16', from: 'Design Weekly', subject: '☝️ Design That Inspires: Art, Web & Creative Ideas That Work', preview: 'Explore fresh perspectives on building better websites, connecti…', time: 'Oct 29', unread: true },
  { id: 'm17', from: 'PhotoBoard', subject: 'About your PhotoBoard account', preview: 'Hi, you’re receiving this email because someone tried to log into your account. If you…', time: 'Oct 28', unread: true },
  { id: 'm18', from: 'ArtSpace', subject: 'Your special Halloween treat is inside 🎃', preview: 'A little something from ArtSpace, just for you. Open before Nov 1.', time: 'Oct 28', unread: true },
];
