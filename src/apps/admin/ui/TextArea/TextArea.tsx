/** @ui TextArea — Base UI Field with a textarea control, same skin as Input. */
import type { TextareaHTMLAttributes } from 'react';
import { Field } from '@base-ui/react/field';
import f from '../field.module.css';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'defaultValue'> {
  label: string;
  minRows?: number;
  value: string;
  hint?: string;
}

export function TextArea({ label, minRows = 3, hint, value, onChange, ...rest }: TextAreaProps) {
  return (
    <Field.Root className={f.root}>
      <Field.Label className={f.label}>{label}</Field.Label>
      <div className={f.box}>
        <Field.Control render={<textarea {...rest} rows={minRows} value={value} onChange={onChange} />} className={f.control} />
      </div>
      {hint && <Field.Description className={f.hint}>{hint}</Field.Description>}
    </Field.Root>
  );
}
