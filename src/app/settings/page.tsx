"use client";

import { useEffect, useMemo, useState } from "react";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { getTasks } from "@/lib/storage";
import { Task } from "@/types";

export default function SettingsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => { setTasks(getTasks()); }, []);
  const archivedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);

  return (
    <PageShell title="我的">
      <div className="space-y-3">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black">我的异色收藏</h2>
            <Badge className="bg-emerald-100 text-[9px] text-emerald-700">已获取 {archivedTasks.length}</Badge>
          </div>

          {archivedTasks.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p>还没有获取到异色精灵</p>
              <p className="mt-1 text-xs">开始抓取后会在这里记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              {archivedTasks.map((task) => (
                <div key={task.id} className="rounded-[12px] bg-white/80 p-1.5 text-center">
                  <PetImage src={task.image} alt={task.petName} className="mx-auto aspect-square w-full max-w-[56px] rounded-full border-2 border-emerald-200" />
                  <p className="mt-1 line-clamp-1 text-[8px] font-black">{task.petName}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
