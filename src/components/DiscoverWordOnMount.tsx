"use client";

import { useEffect } from "react";

import { useGameStore } from "@/store/useGameStore";

export function DiscoverWordOnMount({ wordId }: { wordId: string }) {
  const discoverWord = useGameStore((s) => s.discoverWord);

  useEffect(() => {
    discoverWord(wordId);
  }, [discoverWord, wordId]);

  return null;
}
