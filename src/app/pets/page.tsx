"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/page-shell";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getOwnedSpiritIds, getSpiritGlobalShinyCount } from "@/lib/calculations";
import { getSpirits } from "@/lib/storage";
import { plans } from "@/lib/task-factory";
import { Spirit } from "@/types";

function normalizeSpiritName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

export default function PetsPage() {
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    setSpirits(getSpirits());
  }, []);

  const ownedIds = useMemo(() => getOwnedSpiritIds(), [spirits]);
  const directedSpiritIds = useMemo(
    () => new Set(plans.find((plan) => plan.isDirected)?.targetSpiritIds ?? []),
    [],
  );

  const visibleSpirits = useMemo(() => {
    const deduped = new Map<string, Spirit>();

    for (const spirit of spirits) {
      if (!directedSpiritIds.has(spirit.id)) continue;

      const key = normalizeSpiritName(spirit.name) || spirit.id;
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, spirit);
        continue;
      }

      // Prefer the record that matches the directed plan id and has a valid image.
      const shouldReplace =
        existing.id !== spirit.id && directedSpiritIds.has(spirit.id) && !directedSpiritIds.has(existing.id);

      if (shouldReplace || (!existing.image && spirit.image)) {
        deduped.set(key, spirit);
      }
    }

    return Array.from(deduped.values()).sort((a, b) => {
      const aOwned = ownedIds.has(a.id) ? 1 : 0;
      const bOwned = ownedIds.has(b.id) ? 1 : 0;
      if (aOwned !== bOwned) return bOwned - aOwned;
      return a.name.localeCompare(b.name, "zh-CN");
    });
  }, [spirits, ownedIds, directedSpiritIds]);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return visibleSpirits;

    return visibleSpirits.filter((item) => item.name.toLowerCase().includes(query));
  }, [keyword, visibleSpirits]);

  return (
    <PageShell title="图鉴">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black">异色图鉴总览</h2>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">
              已拥有 {ownedIds.size}/{visibleSpirits.length}
            </Badge>
          </div>

          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜索异色精灵名称"
            className="mt-4 h-11 w-full rounded-2xl border border-input bg-white px-4 text-sm outline-none transition focus:border-primary"
          />
        </Card>

        <div className="grid grid-cols-4 gap-3">
          {filtered.map((spirit) => {
            const totalShinyCount = getSpiritGlobalShinyCount(spirit.id);
            const owned = ownedIds.has(spirit.id);

            return (
              <Link
                key={spirit.id}
                href={`/spirits/view?spiritId=${encodeURIComponent(spirit.id)}`}
                className="block transition-transform hover:-translate-y-1"
              >
                <Card
                  className={`p-2 text-center ${
                    owned ? "border-emerald-200 bg-emerald-50/60" : "bg-white/90"
                  }`}
                >
                  <div className="relative">
                    <PetImage
                      src={spirit.image}
                      alt={spirit.name}
                      className={`mx-auto h-16 w-16 rounded-full border-2 ${
                        owned ? "border-emerald-400" : "border-amber-200"
                      }`}
                    />
                    {totalShinyCount > 0 && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-2 py-1 text-[9px] font-bold text-white">
                        {totalShinyCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[10px] font-semibold">{spirit.name}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {owned ? "已拥有" : "未拥有"}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
