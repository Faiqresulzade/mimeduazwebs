import { useEffect, useRef, useState } from 'react';

/**
 * Sınaq sayğacı. Başlanğıc dəyər backend-in verdiyi `remainingSeconds`-dir —
 * lokal saatdan hesablanmır (CHANGELOG_EXAMS §5), çünki brauzerin saatı
 * dəyişdirilə bilər. Sıfıra çatanda `onExpire` bir dəfə çağırılır.
 */
export function useExamCountdown(
  remainingSeconds: number | null,
  onExpire: () => void,
) {
  const [seconds, setSeconds] = useState(remainingSeconds ?? 0);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (remainingSeconds === null) return;
    setSeconds(remainingSeconds);
    expiredRef.current = false;
  }, [remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === null) return;

    const timer = setInterval(() => {
      setSeconds((current) => {
        const next = current - 1;
        if (next <= 0 && !expiredRef.current) {
          expiredRef.current = true;
          onExpireRef.current();
        }
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  return seconds;
}

/** 125 → "02:05", 3725 → "1:02:05" */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
