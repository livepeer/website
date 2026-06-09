"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Cycles through a list of words in place with a vertical fade/slide/blur
 * swap (x.ai hero style). Renders on its own centered line so the surrounding
 * heading text never reflows. Respects prefers-reduced-motion by holding the
 * first word static.
 *
 * The animated word carries bottom padding (with a matching negative margin on
 * the wrapper) so descenders aren't clipped by the blur filter / gradient clip.
 *
 * `suffix` renders a static, non-cycling string (e.g. a period) right after the
 * word in the inherited text color.
 */
export default function CyclingWords({
  words,
  suffix,
  interval = 2200,
  className = "",
}: {
  words: string[];
  suffix?: string;
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(id);
  }, [reduce, interval, words.length]);

  return (
    <span className="-mb-[0.18em] flex items-start justify-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className={`inline-block whitespace-nowrap pb-[0.18em] ${className}`}
          initial={{ y: "0.55em", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-0.55em", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
      {suffix ? (
        <span className="pb-[0.18em]" aria-hidden="true">
          {suffix}
        </span>
      ) : null}
    </span>
  );
}
