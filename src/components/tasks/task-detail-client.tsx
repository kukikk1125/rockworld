"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CycleStatusCard } from "@/components/tasks/cycle-status-card";
import { PetInfoCard } from "@/components/tasks/pet-info-card";
import { TaskStatusCard } from "@/components/tasks/task-status-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { hydrateTask } from "@/lib/calculations";
import { getTasks, saveTask, setCurrentTask } from "@/lib/storage";
import { Task } from "@/types";

export function TaskDetailClient() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showArchiveSuccess, setShowArchiveSuccess] = useState(false);

  useEffect(() => {
    const matched = getTasks().find((item) => item.id === params.id);
    if (matched) {
      const hydratedTask = hydrateTask(matched);
      setTask(hydratedTask);
      setCurrentTask(hydratedTask.completed ? undefined : hydratedTask.id);
    }
  }, [params.id]);

  const hydrated = useMemo(() => (task ? hydrateTask(task) : null), [task]);

  function persist(nextTask: Task) {
    const finalTask = hydrateTask({
      ...nextTask,
      updatedAt: new Date().toISOString(),
    });
    setTask(finalTask);
    saveTask(finalTask);
  }

  function incrementShield() {
    if (!task || task.completed) return;
    persist({
      ...task,
      shieldBreakCount: task.shieldBreakCount + 1,
      actionHistory: [...(task.actionHistory || []), "shield"],
    });
  }

  function incrementNormal() {
    if (!task || task.completed) return;
    persist({
      ...task,
      normalCaughtCount: task.normalCaughtCount + 1,
      actionHistory: [...(task.actionHistory || []), "normal"],
    });
  }

  function handleClearLast() {
    if (!task || task.completed) return;
    const history = task.actionHistory || [];
    if (history.length === 0) return;
    const lastAction = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    persist({
      ...task,
      shieldBreakCount: lastAction === "shield" ? Math.max(0, task.shieldBreakCount - 1) : task.shieldBreakCount,
      normalCaughtCount: lastAction === "normal" ? Math.max(0, task.normalCaughtCount - 1) : task.normalCaughtCount,
      actionHistory: newHistory,
    });
  }

  function handleArchiveConfirm() {
    if (!task || task.completed) return;
    const finalStatus = task.shieldBreakCount >= 80 ? "保底获取" : "概率获取";
    const archivedTask = { ...task, completed: true, shinyStatus: finalStatus } as Task;

    setShowArchiveConfirm(false);
    setShowAnimation(true);
    persist(archivedTask);
    setCurrentTask(undefined);
    setShowArchiveSuccess(true);
  }

  if (!hydrated) {
    return (
      <Card className="p-8 text-center">
        <p>未找到对应任务。</p>
      </Card>
    );
  }

  const isLocked = hydrated.completed;

  return (
    <>
      <div className="space-y-3">
        <PetInfoCard task={hydrated} />
        <Card className="overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-black">点一下就记一次</h3>
            {isLocked && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                已存档，记录锁定
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2">
              <ActionButton label="+1 污染" tone="rose" onClick={incrementShield} disabled={isLocked} />
              <ActionButton label="+1 原色" tone="sky" onClick={incrementNormal} disabled={isLocked} />
              <ActionButton label="异色" variant="outline" onClick={() => setShowArchiveConfirm(true)} disabled={isLocked} />
              <ActionButton
                label="撤销"
                variant="outline"
                onClick={handleClearLast}
                disabled={isLocked || hydrated.actionHistory.length === 0}
              />
            </div>
            {isLocked && (
              <p className="px-1 text-[11px] leading-5 text-muted-foreground">
                这条记录已经存入异色档案，后续不再允许修改污染、原色和撤销操作。
              </p>
            )}
          </div>
        </Card>

        <TaskStatusCard task={hydrated} showAnimation={showAnimation} />
        <CycleStatusCard task={hydrated} />
      </div>

      <ConfirmDialog
        open={showArchiveConfirm}
        title="确认存档异色"
        description="确认后会将当前任务存入异色档案，并锁定这条记录，后续无法继续修改。"
        confirmText="确认存档"
        cancelText="再想想"
        confirmVariant="default"
        onCancel={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchiveConfirm}
      />

      <ConfirmDialog
        open={showArchiveSuccess}
        title="已完成存档"
        description="异色图标已经写入核心统计，这条记录也已锁定。之后你仍可以查看详情，但不能再改动计数。"
        confirmText="我知道了"
        hideCancel
        confirmVariant="default"
        onCancel={() => setShowArchiveSuccess(false)}
        onConfirm={() => setShowArchiveSuccess(false)}
      />
    </>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "default",
  disabled,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "destructive" | "ghost";
  disabled?: boolean;
  tone?: "default" | "rose" | "sky" | "emerald";
}) {
  const toneClasses = {
    default: "",
    rose: "bg-rose-500 text-white hover:bg-rose-600",
    sky: "bg-sky-500 text-white hover:bg-sky-600",
    emerald: "bg-emerald-500 text-white hover:bg-emerald-600",
  };
  const isGhost = variant === "ghost";

  return (
    <Button
      size="lg"
      variant={isGhost ? "ghost" : variant}
      className={`h-10 rounded-xl text-[10px] font-black ${variant === "default" ? toneClasses[tone] : ""} ${
        isGhost ? "text-muted-foreground" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
