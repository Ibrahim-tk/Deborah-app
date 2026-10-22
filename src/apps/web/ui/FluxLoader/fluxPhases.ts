export interface FluxPhase {
  /** 0–100 threshold at or past which `label` shows. */
  at: number;
  label: string;
}

/** Latest phase whose threshold has been crossed. */
export function fluxLabel(value: number, phases: FluxPhase[]): string {
  return [...phases].sort((a, b) => a.at - b.at).reduce((l, p) => (value >= p.at ? p.label : l), phases[0]?.label ?? '');
}
