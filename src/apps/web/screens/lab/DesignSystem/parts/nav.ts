/** Page order and sidebar groups for the design system. V2 web flows only. */
import type { ComponentType } from 'react';
import { Foundations } from './sections/Foundations';
import { Colors } from './sections/Colors';
import { Typography } from './sections/Typography';
import { Shape } from './sections/Shape';
import { Icons } from './sections/Icons';
import { Actions } from './sections/Actions';
import { Controls } from './sections/Controls';
import { Pickers } from './sections/Pickers';
import { Surfaces } from './sections/Surfaces';
import { Feedback } from './sections/Feedback';
import { ChatPatterns } from './sections/ChatPatterns';
import { CommercePatterns } from './sections/CommercePatterns';
import { WidgetPatterns } from './sections/WidgetPatterns';

interface Entry { id: string; label: string; Component: ComponentType }

export const NAV: { title: string; items: Entry[] }[] = [
  {
    title: 'Foundations',
    items: [
      { id: 'overview', label: 'Overview', Component: Foundations },
      { id: 'color', label: 'Colour', Component: Colors },
      { id: 'type', label: 'Typography', Component: Typography },
      { id: 'shape', label: 'Shape', Component: Shape },
      { id: 'icons', label: 'Iconography', Component: Icons },
    ],
  },
  {
    title: 'Components',
    items: [
      { id: 'buttons', label: 'Buttons', Component: Actions },
      { id: 'controls', label: 'Choices and fields', Component: Controls },
      { id: 'pickers', label: 'Pickers', Component: Pickers },
      { id: 'surfaces', label: 'Surfaces and lists', Component: Surfaces },
      { id: 'feedback', label: 'Progress and presence', Component: Feedback },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { id: 'chat', label: 'Chat', Component: ChatPatterns },
      { id: 'widgets', label: 'Chat widgets', Component: WidgetPatterns },
      { id: 'commerce', label: 'Plans and family', Component: CommercePatterns },
    ],
  },
];

export const SECTIONS: Entry[] = NAV.flatMap((g) => g.items);
