/** The frame (ui/BottomSheet) hands its close action to the sheet surface (ui/Sheet), which draws the button in
 *  its own title row. null = this sheet has no close button. */
import { createContext } from 'react';

export const SheetCloseContext = createContext<(() => void) | null>(null);
