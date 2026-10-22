import type { ReactNode } from 'react';
import field from '../homeField.module.css';

export function HomeSectionLabel({ children }: { children: ReactNode }) {
  return <h2 className={field.label}>{children}</h2>;
}
