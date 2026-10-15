/** Shows the SimKeyboard while a text field inside the phone has focus (and the toggle is on). */
import { useEffect, useState, type RefObject } from 'react';

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLTextAreaElement ||
  (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit', 'range'].includes(el.type)) ||
  (el instanceof HTMLElement && el.isContentEditable);

export function useSimKeyboard(screenRef: RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const onIn = (e: FocusEvent) => setFocused(isTextField(e.target));
    const onOut = (e: FocusEvent) => {
      if (!isTextField(e.relatedTarget)) setFocused(false);
    };
    el.addEventListener('focusin', onIn);
    el.addEventListener('focusout', onOut);
    return () => {
      el.removeEventListener('focusin', onIn);
      el.removeEventListener('focusout', onOut);
    };
  }, [screenRef]);

  return enabled && focused;
}
