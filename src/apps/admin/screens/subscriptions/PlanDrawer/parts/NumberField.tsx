/** Whole-number input on top of the shared Input; empty reads as 0. */
import { Input } from '@admin/ui';

export function NumberField({ label, value, hint, min = 0, onChange }: { label: string; value: number; hint?: string; min?: number; onChange: (v: number) => void }) {
  return (
    <Input
      label={label}
      hint={hint}
      type="number"
      inputMode="numeric"
      min={min}
      value={String(value)}
      onChange={(e) => onChange(Math.max(min, Math.floor(Number(e.target.value) || 0)))}
    />
  );
}
