/** Memory (docs/07-ai-simulation.md §5): greetings that remember the last topic. */
import { persona } from '../data';
import { dayPart } from '../utils/dates';
import { interpolate } from '../utils/text';

export interface Greeting {
  line: string;
  question: string;
  /** Set when there is history: "Welcome back… Last time we talked about {topic}." */
  welcomeBack?: string;
}

/** `forOther`: asking for another profile — "Let's talk about {name}." (F06 M-6.2). */
export function greeting(name: string, now: Date, lastTopic?: string, forOther = false): Greeting {
  const v = persona.voice;
  if (forOther) {
    return {
      line: interpolate(v.greetingOther, { name }),
      question: v.openingQuestion,
      welcomeBack: lastTopic ? interpolate(v.welcomeBackOther, { topic: lastTopic }) : undefined,
    };
  }
  const part = dayPart(now);
  const template = part === 'morning' ? v.greetingMorning : part === 'afternoon' ? v.greetingAfternoon : v.greetingEvening;
  return {
    line: interpolate(template, { name }),
    question: v.openingQuestion,
    welcomeBack: lastTopic ? interpolate(v.welcomeBack, { name, topic: lastTopic }) : undefined,
  };
}
