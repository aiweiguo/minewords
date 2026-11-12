"use client";

import { useCallback, useState } from "react";

/**
 * Shared phonics session state for fight / craft / trade hosts (MW-33).
 * Keeps miss → short learn → resume boost behavior aligned.
 */
export function usePhonicsSession() {
  const [phonicsWordId, setPhonicsWordId] = useState<string | null>(null);
  const [phonicsBoost, setPhonicsBoost] = useState(false);

  const phonicsOpen = phonicsWordId !== null;

  const openPhonics = useCallback((targetId?: string | null) => {
    if (!targetId) return;
    setPhonicsWordId(targetId);
  }, []);

  const skipPhonics = useCallback(() => {
    setPhonicsWordId(null);
  }, []);

  const completePhonics = useCallback(() => {
    setPhonicsWordId(null);
    setPhonicsBoost(true);
  }, []);

  const resetPhonics = useCallback(() => {
    setPhonicsWordId(null);
    setPhonicsBoost(false);
  }, []);

  function showPhonicsCue(unknownWordId: string | null | undefined): boolean {
    return Boolean(unknownWordId) && !phonicsBoost && !phonicsOpen;
  }

  return {
    phonicsWordId,
    phonicsBoost,
    phonicsOpen,
    openPhonics,
    skipPhonics,
    completePhonics,
    resetPhonics,
    showPhonicsCue,
  };
}
