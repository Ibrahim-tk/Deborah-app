import { useScreenParams } from '@mobile/navigation';

/** Internal Screens menu "Basic details": open past "who is this for" (as Myself). */
export function useStartAtDetails(): boolean {
  return useScreenParams<{ start: 'details' }>().start === 'details';
}
