/**
 * @screen  A-13.3 · Upload or edit content (centred modal)
 * @flow    A13 Knowledge Base management (story 6.2)
 * @states  new · new from a dropped file · answer to a gap · editing · file error · uploading · uploaded
 * @spec    docs/admin/stories.md#62---add-new-content
 * @xref    web: none (admin only)
 */
/** Upload content / Edit (story 6.2), in a centred modal over the Knowledge Base: only what's needed up front — title, kind, and a file (big drop zone or
 *  button, with a preview before saving) or typed text. The linked gap sits under "More options". Make live (an
 *  Admin's sends it for approval instead) or Save as draft. A banner then says what happened. */
import { useState } from 'react';
import { CONTENT_TYPES, contentText, useAdminStore, useKnowledge, type ContentItem, type ContentType, type KnowledgeGap } from '@shared/admin';
import { Button, Dialog, FileDrop, Input, Select, TextArea, type PickedFile } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import { useAdminNav } from '@admin/navigation';
import { UnsavedChangesDialog } from '@admin/patterns';
import styles from '../ContentDrawer/ContentDrawer.module.css';

const OK = /\.(pdf|docx|txt)$/i;
const MAX = 20 * 1024 * 1024;

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
  const [more, setMore] = useState(false);
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
      // Close the modal and open the saved item, with the result banner showing.
      kb.setEditor(null);
      useAdminNav.getState().openDrawer({ kind: 'content', id });
    }, undefined, 1200);
  };

  const leave = () => { useKnowledge.getState().setDroppedFile(null); onCancel(); };
  const cancel = () => (dirty ? setLeaving(true) : leave());

  return (
    <Dialog
      title={item ? `Edit “${item.title}”` : gap ? 'Answer this question' : 'Upload content'}
      width="lg"
      onClose={cancel}
      footer={
        <>
          <Button variant="ghost" onClick={cancel}>Cancel</Button>
          <Button variant="secondary" onClick={() => save(false)}>Save as draft</Button>
          <Button loading={sim.busy} onClick={() => save(true)}>{isSuper ? 'Make live' : 'Send for approval'}</Button>
        </>
      }
    >
      <div className={styles.form}>
        <p className={styles.note}>{item ? 'Saving keeps the earlier version in its history.' : 'The Oracle only answers from content that’s live.'}</p>
        {!item && (
          <FileDrop
            file={file}
            accept=".pdf,.docx,.txt"
            hint="PDF, Word or text file, up to 20 MB"
            error={fileError || (touched && !typing ? errors.content : undefined)}
            state={upload}
            onPick={pick}
            onRemove={() => { setFile(null); setFileError(''); setUpload('idle'); }}
          />
        )}
        {!typing && !file ? (
          <Button variant="link" className={styles.linkBtn} onClick={() => setTyping(true)}>Or type the text instead</Button>
        ) : null}
        {typing && <TextArea label="Text" value={text} minRows={10} hint={touched && !file ? errors.content : undefined} onChange={(e) => setText(e.target.value)} />}
        <Input label="Title" value={title} error={touched ? errors.title : undefined} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <Select<ContentType> label="What kind of content is it?" placeholder="Choose one" value={type} onChange={setType} options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))} />
          {touched && errors.type && <p className={styles.error}>{errors.type}</p>}
        </div>
        {gap && (
          <div className={styles.more}>
            <Button variant="link" className={styles.linkBtn} aria-expanded={more} onClick={() => setMore((m) => !m)}>{more ? 'Fewer options' : 'More options'}</Button>
            {more && <p className={styles.note}>Answers the question &ldquo;{gap.question}&rdquo;. Making it live marks the gap as answered.</p>}
          </div>
        )}
      </div>
      {leaving && <UnsavedChangesDialog onLeave={leave} onStay={() => setLeaving(false)} />}
    </Dialog>
  );
}
