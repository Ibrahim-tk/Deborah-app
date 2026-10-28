/** Page order and sidebar groups for the design system. V2 mobile flows only. */
import type { ComponentType } from 'react';
import { Foundations } from './sections/Foundations';
import { Colors } from './sections/Colors';
import { Typography } from './sections/Typography';
import { Space } from './sections/Space';
import { Shape } from './sections/Shape';
import { Depth } from './sections/Depth';
import { Motion } from './sections/Motion';
import { Icons } from './sections/Icons';
import { Actions } from './sections/Actions';
import { Controls } from './sections/Controls';
import { Pickers } from './sections/Pickers';
import { Surfaces } from './sections/Surfaces';
import { Feedback } from './sections/Feedback';
import { ChatPatterns } from './sections/ChatPatterns';
import { AnswerPatterns } from './sections/AnswerPatterns';
import { SafetyPatterns } from './sections/SafetyPatterns';
import { HealthPatterns } from './sections/HealthPatterns';
import { CommercePatterns } from './sections/CommercePatterns';
import { WidgetPatterns } from './sections/WidgetPatterns';
import { Rules } from './sections/Rules';

interface Entry { id: string; label: string; Component: ComponentType }

export const NAV: { title: string; items: Entry[] }[] = [
  {
    title: 'Foundations',
    items: [
      { id: 'overview', label: 'Overview', Component: Foundations },
      { id: 'color', label: 'Colour', Component: Colors },
      { id: 'type', label: 'Typography', Component: Typography },
      { id: 'space', label: 'Space', Component: Space },
      { id: 'shape', label: 'Shape', Component: Shape },
      { id: 'depth', label: 'Depth', Component: Depth },
      { id: 'motion', label: 'Motion', Component: Motion },
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
      { id: 'answer', label: 'The Oracle’s answer', Component: AnswerPatterns },
      { id: 'safety', label: 'Safety', Component: SafetyPatterns },
      { id: 'health', label: 'My Health', Component: HealthPatterns },
      { id: 'commerce', label: 'Plans and family', Component: CommercePatterns },
      { id: 'widgets', label: 'Chat widgets', Component: WidgetPatterns },
    ],
  },
  { title: 'Guidelines', items: [{ id: 'rules', label: 'Do’s and don’ts', Component: Rules }] },
];

export const SECTIONS: Entry[] = NAV.flatMap((g) => g.items);
