/** Add content / Edit (story 6.2): title, type, and a file or typed text (one is required). Save as draft or
 *  Publish; an Admin's Publish sends it to the Super Admin for approval instead. */
import { useState } from 'react';
import { CONTENT_TYPES, contentText, useAdminStore, useKnowledge, type ContentItem, type ContentType, type KnowledgeGap } from '@shared/admin';
import { Button, Drawer, Input, Select, TextArea } from '@admin/ui';
import { useSim } from '@admin/hooks/useSim';
import { useAdminNav } from '@admin/navigation';
import styles from './ContentDrawer.module.css';

const OK = /\.(pdf|docx|txt)$/i;
const MAX = 20 * 1024 * 1024;

export function ContentForm({ item, gap, onCancel }: { item?: ContentItem; gap?: KnowledgeGap; onCancel: () => void }) {
  const isSuper = useAdminStore((s) => s.role === 'super');
  const [title, setTitle] = useState(item?.title ?? gap?.question ?? '');
  const [type, setType] = useState<ContentType | undefined>(item?.type ?? (gap ? 'Knowledge gap answer' : undefined));
  const [text, setText] = useState(item ? contentText(item) : '');
  const [file, setFile] = useState('');
  const [fileError, setFileError] = useState('');
  const [touched, setTouched] = useState(false);
  const sim = useSim();
  const errors = {
    title: !title.trim() ? 'Please add a title.' : undefined,
    type: !type ? 'Please choose a content type.' : undefined,
    content: !text.trim() && !file ? 'Please upload a file, or add the text.' : undefined,
  };

  const pick = (f?: File) => {
    if (!f) return;
    if (!OK.test(f.name)) return setFileError('This file type isn’t supported. Please upload a PDF, Word or text file.');
    if (f.size > MAX) return setFileError('This file is too large. Please upload a smaller file.');
    setFileError('');
    setFile(f.name);
  };

  const save = (publish: boolean) => {
    setTouched(true);
    if (errors.title || errors.type || errors.content) return;
    const body = text.trim() || `Uploaded file: ${file}`;
    const done = !publish ? 'Your draft has been saved.' : isSuper ? 'Your content has been published. The Oracle will start using it shortly.' : 'Your content has been sent to the Super Admin for approval.';
    sim.run(() => {
      const id = useKnowledge.getState().save({ id: item?.id, title: title.trim(), type: type!, text: body, gapId: gap?.id }, publish);
      useAdminNav.getState().openDrawer({ kind: 'content', id });
    }, done, 1000);
  };

  return (
    <Drawer
      title={item ? `Edit ${item.title}` : gap ? 'Add answer' : 'Add content'}
      subtitle={item ? `Saving creates version ${item.version + 1}` : undefined}
      onClose={onCancel}
      actions={
        <>
          <Button size="sm" loading={sim.busy} onClick={() => save(true)}>{isSuper ? 'Publish' : 'Send for approval'}</Button>
          <Button size="sm" variant="secondary" onClick={() => save(false)}>Save as draft</Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input label="Title" value={title} error={touched ? errors.title : undefined} onChange={(e) => setTitle(e.target.value)} />
        <div>
          <Select<ContentType> label="Content type" placeholder="Choose a content type" value={type} onChange={setType} options={CONTENT_TYPES.map((t) => ({ value: t, label: t }))} />
          {touched && errors.type && <p className={styles.error}>{errors.type}</p>}
        </div>
        <Input label="Upload a file (PDF, Word or text)" type="file" accept=".pdf,.docx,.txt" error={fileError || undefined} onChange={(e) => pick(e.target.files?.[0])} />
        {file && <p className={styles.note}>Ready to upload: {file}</p>}
        <TextArea label="Or type or paste the text" value={text} minRows={10} hint={touched ? errors.content : undefined} onChange={(e) => setText(e.target.value)} />
        {gap && <p className={styles.note}>Answers the knowledge gap &ldquo;{gap.question}&rdquo;. Publishing marks it Answered.</p>}
      </div>
    </Drawer>
  );
}
