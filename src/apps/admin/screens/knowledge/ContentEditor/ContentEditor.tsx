/**
 * @screen  A-13.3 · Add or edit content (full page inside Knowledge Base)
 * @flow    A13 Knowledge Base management (story 6.2)
 * @states  new · new from a dropped file · answer to a gap · editing · file error · uploading · uploaded
 * @spec    docs/admin/stories.md#62---add-new-content
 * @xref    web: none (admin only)
 */
/** Add content / Edit (story 6.2), as its own page in the Knowledge Base section (not a modal). Two numbered steps —
 *  1. Upload file, 2. Add details — each with a short explanation on the left; actions along the bottom.
 *  Originally: only what's needed up front — title, kind, and a file (big drop zone or
 *  button, with a preview before saving) or typed text. The linked gap sits under "More options". Make live (an
 *  Admin's sends it for approval instead) or Save as draft. A banner then says what happened. */
import { useState } from 'react';
import { CONTENT_TYPES, contentText, useAdminStore, useKnowledge, type ContentItem, type ContentType, type KnowledgeGap } from '@shared/admin';
import { Button, FileDrop, Input, Select, TextArea, type PickedFile } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import { useAdminNav } from '@admin/navigation';
import { AdminPage, UnsavedChangesDialog } from '@admin/patterns';
import styles from './ContentEditor.module.css';

const OK = /\.(pdf|docx|txt)$/i;
const MAX = 200 * 1024 * 1024;

export default function ContentEditor({ param }: { param: string }) {
  const item = useKnowledge((s) => s.items.find((c) => c.id === param));
  const gap = useKnowledge((s) => (param.startsWith('new:') ? s.gaps.find((g) => g.id === param.slice(4)) : undefined));
  const onCancel = () => useKnowledge.getState().setEditor(null);
  return <Editor key={param} item={item} gap={gap} onCancel={onCancel} />;
}

function Editor({ item, gap, onCancel }: { item?: ContentItem; gap?: KnowledgeGap; onCancel: () => void }) {
  const isSuper = useAdminStore((s) => s.role === 'super');
  const dropped = useKnowledge((s) => s.droppedFile);
  const [title, setTitle] = useState(item?.title ?? gap?.question ?? (dropped ? dropped.name.replace(/\.[^.]+$/, '') : ''));
  const [type, setType] = useState<ContentType | undefined>(item?.type ?? (gap ? 'Knowledge gap answer' : undefined));
  const [text, setText] = useState(item ? contentText(item) : '');
  const [typing, setTyping] = useState(Boolean(item));
  const [file, setFile] = useState<PickedFile | null>(dropped);
  const [fileError, setFileError] = useState('');
  const [upload, setUpload] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  // Starting values, to tell whether closing would lose anything.
  const [start] = useState(() => ({ title, type, text, file }));
  const dirty = title !== start.title || type !== start.type || text !== start.text || file !== start.file;
  const [leaving, setLeaving] = useState(false);
  const errors = {
    title: !title.trim() ? 'Please add a title.' : undefined,
    type: !type ? 'Please choose a content type.' : undefined,
    content: !text.trim() && !file ? 'Please upload a file, or add the text.' : undefined,
  };

  const pick = (f: File) => {
    setFile({ name: f.name, size: f.size });
    setUpload('idle');
    if (!OK.test(f.name)) return setFileError('This file type isn’t supported. Please upload a PDF, Word or text file.');
    if (f.size > MAX) return setFileError('This file is too large. Please upload a smaller file.');
    setFileError('');
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const save = (live: boolean) => {
    setTouched(true);
    if (errors.title || errors.type || errors.content || fileError) return;
    const name = title.trim();
    const notice = !live
      ? `“${name}” is saved as a draft. It isn’t live yet.`
      : isSuper ? `“${name}” is now live. The Oracle will start using it shortly.` : `“${name}” was sent to the Super Admin for approval.`;
    if (file) setUpload('uploading');
    sim.run(() => {
      const kb = useKnowledge.getState();
      const id = kb.save({ id: item?.id, title: name, type: type!, text: text.trim() || `Uploaded file: ${file?.name}`, gapId: gap?.id }, live);
      kb.setDroppedFile(null);
      kb.setNotice(notice);
      // Back to the Knowledge Base list, with the saved item open and the result banner showing.
      kb.setEditor(null);
      useAdminNav.getState().openDrawer({ kind: 'content', id });
    }, undefined, 1200);
  };

  const leave = () => { useKnowledge.getState().setDroppedFile(null); onCancel(); };
  const cancel = () => (dirty ? setLeaving(true) : leave());

  const heading = item ? `Edit \u201c${item.title}\u201d` : gap ? 'Answer this question' : 'Add content';
  return (
    <AdminPage
      title={heading}
      subtitle={item ? 'Saving keeps the earlier version in its history.' : 'Upload a file, add a few details, then select Publish.'}
      crumbs={[{ label: 'Knowledge Base', onClick: cancel }, { label: heading }]}
      onBack={cancel}
    >
      <div className={styles.page}>
        {!item && (
          <section className={styles.step}>
            {/* Step 1 switches between uploading a file and typing the text; the switch button names the other way. */}
            <div className={styles.intro}>
              <h2 className={styles.stepTitle}>{typing ? '1. Type the text' : '1. Upload file'}</h2>
              <p className={styles.stepText}>
                {typing ? 'Write or paste the content you want the Oracle to learn from. You can check it before publishing.' : 'Choose the file you want to share. You can check it before publishing.'}
              </p>
            </div>
            <div className={styles.fields}>
              {typing ? (
                <TextArea label="Text" hideLabel placeholder="Type or paste the content here" value={text} minRows={10} hint={touched ? errors.content : undefined} onChange={(e) => setText(e.target.value)} />
              ) : (
                <FileDrop
                  file={file}
                  accept=".pdf,.docx,.txt"
                  hint="PDF, Word or text file, up to 200 MB"
                  error={fileError || (touched ? errors.content : undefined)}
                  state={upload}
                  onPick={pick}
                  onRemove={() => { setFile(null); setFileError(''); setUpload('idle'); }}
                />
              )}
              {!file && (
                <div className={styles.alt}>
                  <span className={styles.or}>or</span>
                  {typing ? (
                    <Button variant="secondary" leadingIcon="upload" onClick={() => setTyping(false)}>Choose a file</Button>
                  ) : (
                    <Button variant="secondary" leadingIcon="edit" onClick={() => setTyping(true)}>Type instead</Button>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
        <section className={styles.step}>
          <div className={styles.intro}>
            <h2 className={styles.stepTitle}>{item ? 'Details' : '2. Add details'}</h2>
            <p className={styles.stepText}>These help the team find the content, and tell the Oracle what it is.</p>
          </div>
          <div className={styles.fields}>
            <Input label="Title" value={title} error={touched ? errors.title : undefined} onChange={(e) => setTitle(e.target.value)} />
            {item && <TextArea label="Text" value={text} minRows={8} hint={touched && !file ? errors.content : undefined} onChange={(e) => setText(e.target.value)} />}
            <div>
              <Select<ContentType> label="Type" placeholder="Choose a type" value={type} onChange={setType} options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))} />
              {touched && errors.type && <p className={styles.error}>{errors.type}</p>}
            </div>
            {gap && <p className={styles.note}>Answers the question &ldquo;{gap.question}&rdquo;. Publishing marks the gap as answered.</p>}
          </div>
        </section>
        <footer className={styles.actions}>
          <Button variant="ghost" onClick={cancel}>Cancel</Button>
          <Button variant="secondary" onClick={() => save(false)}>Save as draft</Button>
          <Button loading={sim.busy} onClick={() => save(true)}>{isSuper ? 'Publish content' : 'Send for approval'}</Button>
        </footer>
      </div>
      {leaving && <UnsavedChangesDialog onLeave={leave} onStay={() => setLeaving(false)} />}
    </AdminPage>
  );
}
