"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAssetPath } from "@/lib/assets";

const navItems = [
  { href: "/", label: "首页", iconPath: "/icons/home.png" },
  { href: "/history", label: "历史", iconPath: "/icons/history.png" },
  { href: "/pets", label: "方案", iconPath: "/icons/pets.png" },
  { href: "/settings", label: "我的", iconPath: "/icons/settings.png" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-[var(--phone-width)]">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 transition-all ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative h-7 w-7">
                  <Image src={getAssetPath(item.iconPath)} alt={item.label} fill className="object-contain" unoptimized />
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
