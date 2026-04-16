"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageShell } from "@/components/ui/page-shell";
import { getTasks, setCurrentTask, deleteTask } from "@/lib/storage";
import { Task } from "@/types";

type ViewMode = "active" | "archive";

export default function HistoryPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("active");
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  function reload() {
    setTasks(getTasks());
  }

  useEffect(() => {
    reload();
  }, []);

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    [tasks],
  );

  function handleSelectTask(task: Task) {
    setCurrentTask(task.id);
    router.push(`/tasks/${task.id}`);
  }

  function handleDelete() {
    if (deleteTarget) {
      deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    }
  }

  const displayTasks = viewMode === "active" ? activeTasks : completedTasks;

  return (
    <PageShell title="任务管理">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-black">
          {viewMode === "active" ? "进行中" : "异色存档"}
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "active" ? "default" : "outline"}
            className="h-8 text-[10px] px-3"
            onClick={() => setViewMode("active")}
          >
            进行中
          </Button>
          <Button
            variant={viewMode === "archive" ? "default" : "outline"}
            className="h-8 text-[10px] px-3"
            onClick={() => setViewMode("archive")}
          >
            存档
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {displayTasks.length ? (
          displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={!task.completed}
              onClick={() => handleSelectTask(task)}
              onDelete={() => setDeleteTarget(task)}
            />
          ))
        ) : (
          <Card className="p-4 text-center text-sm text-muted-foreground">
            {viewMode === "active" ? "暂无进行中的任务" : "暂无异色存档"}
          </Card>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除"
        description={`确定要删除「${deleteTarget?.petName ?? ""}」吗？此操作无法撤销。`}
        confirmText="删除"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}

function TaskCard({
  task,
  isActive,
  onClick,
  onDelete,
}: {
  task: Task;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="p-3">
      <div className="flex gap-3 items-start">
        <button
          type="button"
          onClick={onClick}
          className="flex gap-3 items-start flex-1 min-w-0 text-left"
        >
          <PetImage
            src={task.image}
            alt={task.petName}
            className="aspect-square w-14 rounded-[16px]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-black leading-tight truncate">
                {task.petName}
              </h3>
              <div className="flex gap-1">
                <Badge className="bg-rose-100 text-rose-700 text-[8px]">
                  {task.petType}
                </Badge>
                <Badge className="bg-amber-100 text-amber-700 text-[8px]">
                  {task.mode}
                </Badge>
                {!isActive && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-[8px]">
                    已存档
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {task.familyOrType}
            </p>
            <div className="mt-1 flex items-center justify-between text-[9px] text-muted-foreground">
              <span>
                进度: {task.shieldBreakCount}/80
              </span>
              <span>
                {isActive ? "最后更新: " : "完成时间: "}
                {new Date(task.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-500 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
