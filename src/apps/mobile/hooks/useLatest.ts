import { useEffect, useRef } from 'react';

/** Ref that always holds the latest value, so timers don't restart when a callback is re-created. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}
