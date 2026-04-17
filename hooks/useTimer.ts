import { useEffect, useRef, useState } from 'react';

type Options = {
  seconds: number;
  running: boolean;
  onExpire?: () => void;
  resetKey?: string | number;
};

export function useTimer({ seconds, running, onExpire, resetKey }: Options) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [running, remaining, onExpire]);

  return { remaining, setRemaining };
}
