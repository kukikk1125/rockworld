import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";

export function PageShell({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto w-full max-w-[var(--phone-width)] px-[var(--safe-edge)] pt-[calc(env(safe-area-inset-top)+14px)]">
        <div className="flex flex-col gap-3">
          <header className="px-1 py-3 flex items-center justify-between">
            <h1 className="text-[28px] font-black leading-tight tracking-tight text-left">
              {title}
            </h1>
            {headerRight}
          </header>
          {children}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
