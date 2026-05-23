import Link from "next/link";

export default function CreditsPage() {
  return (
    <main className="space-y-6">
      <Link href="/" className="text-sm font-bold text-primary">
        ← 返回首页
      </Link>

      <section className="mw-card p-6">
        <h1 className="text-3xl font-black text-primary">Credits 素材致谢</h1>
        <p className="mt-3 text-sm font-semibold text-muted">
          MineWords uses placeholder pixel-style SVG art. Replace with licensed assets in the
          same paths when ready.
        </p>
      </section>

      <section className="mw-card space-y-4 p-6 text-sm leading-7">
        <div>
          <h2 className="text-xl font-black">Game-icons.net — CC BY 3.0</h2>
          <p className="mt-2 text-muted">
            Icons from{" "}
            <a
              href="https://game-icons.net/"
              className="font-bold text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              game-icons.net
            </a>{" "}
            are licensed under{" "}
            <a
              href="https://creativecommons.org/licenses/by/3.0/"
              className="font-bold text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons Attribution 3.0 Unported (CC BY 3.0)
            </a>
            .
          </p>
          <p className="mt-2 font-semibold">Drop-in folder:</p>
          <code className="mt-1 block rounded bg-black/30 px-3 py-2 text-xs">
            public/assets/icons/resources/
            <br />
            public/assets/icons/equipment/
            <br />
            public/assets/icons/mobs/
            <br />
            public/assets/icons/ui/
          </code>
        </div>

        <div>
          <h2 className="text-xl font-black">Kenney — CC0</h2>
          <p className="mt-2 text-muted">
            Optional backgrounds and UI tiles from{" "}
            <a
              href="https://kenney.nl/assets"
              className="font-bold text-primary underline"
              target="_blank"
              rel="noreferrer"
            >
              Kenney.nl
            </a>{" "}
            (CC0 1.0 Universal).
          </p>
          <p className="mt-2 font-semibold">Drop-in folder:</p>
          <code className="mt-1 block rounded bg-black/30 px-3 py-2 text-xs">
            public/assets/backgrounds/
            <br />
            public/assets/ui/
          </code>
        </div>

        <p className="text-muted">
          Full notes also live in{" "}
          <code className="rounded bg-black/30 px-2 py-1 text-xs">public/assets/credits.md</code>.
        </p>

        <p className="font-bold text-amber-200">
          This project does not use official Minecraft assets or trademarks.
        </p>
      </section>
    </main>
  );
}
