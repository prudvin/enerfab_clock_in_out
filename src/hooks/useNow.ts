import { useEffect, useState } from 'react';

/** Current time, re-rendered at the start of every second. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const tick = () => {
      const d = new Date();
      setNow(d);
      // Align to the next second boundary so the display never drifts or skips.
      timer = window.setTimeout(tick, 1000 - d.getMilliseconds());
    };
    timer = window.setTimeout(tick, 1000 - new Date().getMilliseconds());
    return () => window.clearTimeout(timer);
  }, []);

  return now;
}
