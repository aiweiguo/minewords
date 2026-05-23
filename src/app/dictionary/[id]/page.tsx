import Link from "next/link";
import { notFound } from "next/navigation";

import { SpeakButton } from "@/components/SpeakButton";
import { getVocabularyById, vocabulary } from "@/data/vocabulary";
import { getRelatedWords } from "@/lib/search";

type DictionaryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DictionaryDetailPage({
  params,
}: DictionaryDetailPageProps) {
  const { id } = await params;
  const word = getVocabularyById(id);

  if (!word) {
    notFound();
  }

  const relatedWords = getRelatedWords(vocabulary, word);

  return (
    <main className="space-y-6">
      <Link href="/dictionary" className="text-sm font-bold text-primary">
        ← 返回词典
      </Link>

      <section className="mw-card p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-secondary">
          {word.category}
        </p>
        <h1 className="mt-2 text-4xl font-black text-primary">{word.english}</h1>
        {word.phonetic ? (
          <p className="mt-2 text-lg text-muted">{word.phonetic}</p>
        ) : null}
        <p className="mt-3 text-2xl font-black">{word.chinese}</p>

        {word.words?.length ? (
          <div className="mt-6">
            <h2 className="text-lg font-black">单词拆解</h2>
            <div className="mt-3 space-y-2">
              {word.words.map((part) => (
                <div
                  key={part.word}
                  className="rounded-xl bg-[#f5f7ef] px-4 py-3 font-semibold"
                >
                  {part.word} {part.phonetic ? part.phonetic : ""} — {part.chinese}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <h2 className="text-lg font-black">例句</h2>
          <p className="mt-2 text-base font-semibold">{word.example}</p>
          <p className="mt-1 text-base text-muted">{word.exampleCn}</p>
        </div>

        <div className="mt-6">
          <SpeakButton text={word.english} />
        </div>
      </section>

      {relatedWords.length > 0 ? (
        <section className="mw-card p-5">
          <h2 className="text-xl font-black">相关词</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedWords.map((related) => (
              <Link
                key={related.id}
                href={`/dictionary/${related.id}`}
                className="rounded-full bg-[#eef6e4] px-4 py-2 text-sm font-bold text-primary"
              >
                {related.english}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
