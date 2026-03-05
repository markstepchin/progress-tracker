"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [{ href: "/compare", label: "Compare" }];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-900"
          >
            Progress
          </Link>

          <div className="flex items-center gap-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/new-check-in"
              className="inline-flex items-center gap-2 rounded-full bg-zinc-900 p-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
