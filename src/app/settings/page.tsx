"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { getTasks } from "@/lib/storage";
import { Task } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const archivedTasks = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );

  return (
    <PageShell title="我的">
      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black">我的异色收藏</h2>
            <Badge className="bg-emerald-100 text-emerald-700 text-[9px]">
              已获取 {archivedTasks.length}
            </Badge>
          </div>

          {archivedTasks.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <p>还没有获取到异色宠物</p>
              <p className="text-xs mt-1">开始刷取后会在这里记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              {archivedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-[12px] bg-white/80 p-1.5 text-center"
                >
                  <PetImage
                    src={task.image}
                    alt={task.petName}
                    className="aspect-square w-full max-w-[56px] mx-auto rounded-full border-2 border-emerald-200"
                  />
                  <p className="line-clamp-1 text-[8px] font-black mt-1">
                    {task.petName}
                  </p>
                  <p className="text-[7px] text-emerald-600 font-medium">
                    {task.shinyStatus}
                  </p>
                  <p className="text-[7px] text-muted-foreground">
                    {task.shieldBreakCount} 次
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
