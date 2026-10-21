/**
 * Multi-choice picks held in the composer (design 2026-10-21, same as M-2.12 FlowChoice): tapping options adds
 * them as composer pills; the composer's Send submits them. No tick under the pills.
 */
import { createContext, useContext } from 'react';

export interface HeldChoice {
  /** Which question the picks belong to. */
  key: string;
  ids: string[];
  labels: string[];
  /** Submit the picks (e.g. IntakeQuestion → engine). */
  finish: (ids: string[]) => void;
}

export interface HeldChoiceContextValue {
  held: HeldChoice | null;
  setHeld: (held: HeldChoice | null) => void;
}

export const HeldChoiceContext = createContext<HeldChoiceContextValue>({ held: null, setHeld: () => {} });
export const useHeldChoice = () => useContext(HeldChoiceContext);
