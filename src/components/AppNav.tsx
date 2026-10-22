"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "基地", icon: "🏠", id: "home" as const },
  { href: "/review", label: "出门", icon: "🚪", id: "fight" as const },
  { href: "/#more", label: "更多", icon: "⋯", id: "more" as const },
];

export function AppNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    function syncHash() {
      setHash(window.location.hash);
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-[#8B6914] bg-[#2a3224]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-1 px-2 py-2">
        {navItems.map((item) => {
          let active = false;
          if (item.id === "home") {
            active = pathname === "/" && hash !== "#more";
          } else if (item.id === "fight") {
            active = pathname.startsWith("/review");
          } else {
            active =
              (pathname === "/" && hash === "#more") ||
              (pathname !== "/" && !pathname.startsWith("/review"));
          }

          return (
            <Link
              key={item.id}
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
