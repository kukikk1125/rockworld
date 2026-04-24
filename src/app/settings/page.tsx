"use client";

import { useMemo } from "react";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { getOwnedSpiritIds, getRecentShinyRecords } from "@/lib/calculations";
import { formatDateTime } from "@/lib/utils";

export default function SettingsPage() {
  const archiveRecords = useMemo(() => getRecentShinyRecords(), []);
  const recentShiny = archiveRecords.slice(0, 6);
  const ownedCount = useMemo(() => getOwnedSpiritIds().size, []);

  return (
    <PageShell title="我的">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black">数据总览</h2>
            </div>
            <Badge className="bg-secondary text-secondary-foreground">总览页</Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-white/85 p-3 text-center">
              <div className="text-[10px] text-muted-foreground">总异色数</div>
              <div className="text-lg font-black text-emerald-600">{archiveRecords.length}</div>
            </div>
            <div className="rounded-2xl bg-white/85 p-3 text-center">
              <div className="text-[10px] text-muted-foreground">已拥有种类</div>
              <div className="text-lg font-black text-primary">{ownedCount}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black">最近获得异色</h2>
            <Badge className="bg-emerald-100 text-emerald-700">{recentShiny.length}</Badge>
          </div>

          {recentShiny.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {recentShiny.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white/85 p-3 text-center">
                  <PetImage
                    src={item.spiritImage}
                    alt={item.spiritName}
                    className="mx-auto h-16 w-16 rounded-full border-2 border-emerald-200"
                  />
                  <p className="mt-2 line-clamp-1 text-[11px] font-black">{item.spiritName}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">还没有异色存档记录。</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
