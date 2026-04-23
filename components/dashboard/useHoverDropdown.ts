"use client";

import { useRef, useState } from "react";

/**
 * Dashboard-scoped duplicate of the marketing header's hover dropdown hook.
 * Duplicated (not imported) so the marketing header stays untouched.
 */
export function useHoverDropdown(delay = 150) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleEnter = () => {
    // Clear any existing timeout to prevent premature closing.
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    // Set a timeout to delay closing, allowing for smoother transitions.
    timeoutRef.current = setTimeout(() => setOpen(false), delay);
  };

  return { open, setOpen, handleEnter, handleLeave };
}
