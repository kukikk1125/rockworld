"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "首页",
    iconPath: "/icons/home.png",
    fallbackIcon: "🏠",
  },
  {
    href: "/history",
    label: "历史",
    iconPath: "/icons/history.png",
    fallbackIcon: "📋",
  },
  {
    href: "/pets",
    label: "精灵",
    iconPath: "/icons/pets.png",
    fallbackIcon: "🐾",
  },
  {
    href: "/settings",
    label: "我的",
    iconPath: "/icons/settings.png",
    fallbackIcon: "⚙️",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border/60">
      <div className="mx-auto max-w-[var(--phone-width)]">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative w-7 h-7">
                  <Image
                    src={item.iconPath}
                    alt={item.label}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
