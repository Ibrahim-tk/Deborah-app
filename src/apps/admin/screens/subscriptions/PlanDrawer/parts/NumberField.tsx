/** Number input on top of the shared Input; empty reads as 0. Whole numbers unless `decimals` (prices, 2 places). */
import { Input } from '@admin/ui';

export interface NumberFieldProps {
  label: string;
  value: number;
  hint?: string;
  min?: number;
  decimals?: boolean;
  onChange: (v: number) => void;
}

export function NumberField({ label, value, hint, min = 0, decimals, onChange }: NumberFieldProps) {
  const parse = (raw: string) => {
    const n = Number(raw) || 0;
    return Math.max(min, decimals ? Math.round(n * 100) / 100 : Math.floor(n));
  };
  return (
    <Input
      label={label}
      hint={hint}
      type="number"
      inputMode={decimals ? 'decimal' : 'numeric'}
      step={decimals ? '0.01' : '1'}
      min={min}
      value={String(value)}
      onChange={(e) => onChange(parse(e.target.value))}
    />
  );
}
