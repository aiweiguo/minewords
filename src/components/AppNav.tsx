"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "基地", icon: "🏠" },
  { href: "/map", label: "地图", icon: "🗺️" },
  { href: "/speak", label: "口语", icon: "🎤" },
  { href: "/minedex", label: "图鉴", icon: "📖" },
  { href: "/quests", label: "任务", icon: "⚔️" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-[#8B6914] bg-[#2a3224]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center rounded-xl px-2 py-2 text-xs font-bold transition-colors ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-black/20"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
