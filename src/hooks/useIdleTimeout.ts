import { useEffect } from 'react';

/** Calls onIdle after `ms` without any pointer/keyboard activity while `active`. */
export function useIdleTimeout(active: boolean, ms: number, onIdle: () => void) {
  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(onIdle, ms);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onIdle, ms);
    };
    const events = ['pointerdown', 'keydown'] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [active, ms, onIdle]);
}
