"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export function TaskSelectDialog({
  open,
  tasks,
  title,
  onClose,
  onSelect,
}: {
  open: boolean;
  tasks: Task[];
  title: string;
  onClose: () => void;
  onSelect: (taskId: string) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4">
      <Card className="w-full max-w-md border-border/80 bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">请选择要归属的任务。</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelect(task.id)}
              className="rounded-2xl border border-border/70 bg-white p-4 text-left transition hover:bg-muted/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-black">{task.taskName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{task.fruitRecipe}</div>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold text-secondary-foreground">
                  {task.mode}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
