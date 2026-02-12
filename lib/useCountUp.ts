"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that counts up from 0 to a target number when the element
 * scrolls into view. Returns the current displayed value as a string.
 */
export function useCountUp(
  target: number,
  opts: {
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
) {
  const { duration = 2000, prefix = "", suffix = "", decimals = 0 } = opts;
  const [value, setValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const startTime = performance.now();

    function tick() {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * target);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [hasStarted, target, duration]);

  const display = `${prefix}${decimals > 0 ? value.toFixed(decimals) : Math.round(value)}${suffix}`;

  return { ref, display };
}
