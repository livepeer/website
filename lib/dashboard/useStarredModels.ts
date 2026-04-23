"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "livepeer-dashboard:starred-models";

function readStarred(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function useStarredModels() {
  const [starredIds, setStarredIds] = useState<string[]>([]);

  useEffect(() => {
    setStarredIds(readStarred());
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setStarredIds(readStarred());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isStarred = useCallback((id: string) => starredIds.includes(id), [starredIds]);

  const toggleStar = useCallback((id: string) => {
    setStarredIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [id, ...prev];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — state still reflects in-memory
      }
      return next;
    });
  }, []);

  return { isStarred, toggleStar, starredIds };
}
