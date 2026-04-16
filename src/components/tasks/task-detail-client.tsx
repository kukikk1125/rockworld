"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CycleStatusCard } from "@/components/tasks/cycle-status-card";
import { PetInfoCard } from "@/components/tasks/pet-info-card";
import { TaskStatusCard } from "@/components/tasks/task-status-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hydrateTask } from "@/lib/calculations";
import { getTasks, saveTask, setCurrentTask } from "@/lib/storage";
import { Task } from "@/types";

export function TaskDetailClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const matched = getTasks().find((item) => item.id === params.id);
    if (matched) {
      setTask(matched);
      setCurrentTask(matched.id);
    }
  }, [params.id]);

  const hydrated = useMemo(() => task ? hydrateTask(task) : null, [task]);

  function persist(nextTask: Task) {
    const finalTask = {
      ...nextTask,
      updatedAt: new Date().toISOString(),
    };
    const hydratedTask = hydrateTask(finalTask);
    setTask(hydratedTask);
    saveTask(hydratedTask);
  }

  function incrementShield() {
    if (!task) return;
    persist({
      ...task,
      shieldBreakCount: task.shieldBreakCount + 1,
      actionHistory: [...(task.actionHistory || []), "shield"],
    });
  }

  function incrementNormal() {
    if (!task) return;
    persist({
      ...task,
      normalCaughtCount: task.normalCaughtCount + 1,
      actionHistory: [...(task.actionHistory || []), "normal"],
    });
  }

  function handleClearLast() {
    if (!task) return;
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

  function handleComplete() {
    if (!task) return;
    setShowAnimation(true);
    
    setTimeout(() => {
      const finalStatus = task.shieldBreakCount >= 80 ? "保底获取" : "概率获取";
      persist({
        ...task,
        completed: true,
        shinyStatus: finalStatus,
      });
      setCurrentTask(undefined);
      router.push("/history");
    }, 1500);
  }

  if (!hydrated) {
    return (
      <Card className="p-8 text-center">
        <p>未找到对应任务。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <PetInfoCard task={hydrated} />
      <Card className="overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-sm font-black">点一下就记一次</h3>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <ActionButton 
              label="+1 污染" 
              tone="rose"
              onClick={incrementShield} 
            />
            <ActionButton 
              label="+1 原色" 
              tone="sky"
              onClick={incrementNormal} 
            />
            <ActionButton
              label="异色"
              variant="outline"
              onClick={handleComplete}
            />
            <ActionButton
              label="撤销"
              variant="outline"
              onClick={handleClearLast}
            />
          </div>
        </div>
      </Card>

      <TaskStatusCard task={hydrated} showAnimation={showAnimation} />
      <CycleStatusCard task={hydrated} />
    </div>
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
    rose: "bg-rose-500 hover:bg-rose-600 text-white",
    sky: "bg-sky-500 hover:bg-sky-600 text-white",
    emerald: "bg-emerald-500 hover:bg-emerald-600 text-white",
  };

  const isGhost = variant === "ghost";

  return (
    <Button
      size="lg"
      variant={isGhost ? "ghost" : variant}
      className={`h-10 rounded-xl text-[10px] font-black ${variant === "default" ? toneClasses[tone] : ""} ${isGhost ? "text-muted-foreground" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  );
}
