"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createTaskFromPreset } from "@/lib/task-factory";
import { deleteTask, saveTask, setCurrentTask } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { Task } from "@/types";

export function HistoryList({
  tasks,
  onChange,
}: {
  tasks: Task[];
  onChange: () => void;
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string>();

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [tasks],
  );

  return (
    <>
      <div className="grid gap-4">
        {sortedTasks.map((task) => (
          <Card key={task.id} className="grid gap-4 p-4">
            <PetImage
              src={task.image}
              alt={task.petName}
              className="aspect-square h-[88px] w-[88px]"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold">{task.petName}</h3>
                <Badge>{task.completed ? "已完成" : "进行中"}</Badge>
                <Badge>{task.shinyStatus}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {task.mode} · {task.familyOrType}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                最后更新时间：{formatDateTime(task.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-start justify-end gap-2">
              <Button variant="outline" onClick={() => router.push(`/tasks/${task.id}`)}>
                查看详情
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentTask(task.id);
                  router.push(`/tasks/${task.id}`);
                }}
              >
                继续任务
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const copied = createTaskFromPreset(undefined, {
                    ...task,
                    id: undefined,
                    createdAt: undefined,
                    updatedAt: undefined,
                    completed: false,
                    probabilityMarked: false,
                    shieldBreakCount: 0,
                    normalCaughtCount: 0,
                    aCaught: 0,
                    bCaught: 0,
                    lastSwitchAt: undefined,
                  });
                  saveTask(copied);
                  router.push(`/tasks/${copied.id}`);
                }}
              >
                复制为新任务
              </Button>
              <Button variant="destructive" onClick={() => setDeleteId(task.id)}>
                删除任务
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="删除历史任务"
        description="删除后无法恢复，确认要移除这条记录吗？"
        confirmText="确认删除"
        onCancel={() => setDeleteId(undefined)}
        onConfirm={() => {
          if (!deleteId) return;
          deleteTask(deleteId);
          setDeleteId(undefined);
          onChange();
        }}
      />
    </>
  );
}
