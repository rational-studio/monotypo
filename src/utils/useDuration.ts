import { useCallback, useState } from 'react';

export function useDuration() {
  const [duration, setDuration] = useState<number>();
  const timeIt = useCallback(() => {
    const start = Date.now();
    return () => {
      const end = Date.now();
      setDuration(end - start);
    };
  }, []);
  return [duration, timeIt] as const;
}
