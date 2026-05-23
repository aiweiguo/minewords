import { VocabularyItem, VocabularyCategory } from "@/types";

export function searchVocabulary(
  items: VocabularyItem[],
  query: string,
  category?: VocabularyCategory | "all",
): VocabularyItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category && category !== "all" && item.category !== category) {
      return false;
    }

    if (!normalizedQuery) return true;

    const haystack = [
      item.english,
      item.chinese,
      ...item.tags,
      ...(item.words?.map((w) => w.word) ?? []),
      ...(item.words?.map((w) => w.chinese) ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function getRelatedWords(
  items: VocabularyItem[],
  item: VocabularyItem,
  limit = 4,
): VocabularyItem[] {
  return items
    .filter(
      (candidate) =>
        candidate.id !== item.id &&
        candidate.tags.some((tag) => item.tags.includes(tag)),
    )
    .slice(0, limit);
}
