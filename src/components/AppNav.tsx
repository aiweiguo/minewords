"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/dictionary", label: "词典", icon: "📖" },
  { href: "/quests", label: "任务", icon: "⚔️" },
  { href: "/inventory", label: "背包", icon: "🎒" },
  { href: "/unlocks", label: "解锁", icon: "🔓" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-[#d9e2cc] bg-white/95 backdrop-blur">
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
                  : "text-muted hover:bg-[#f5f7ef]"
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
