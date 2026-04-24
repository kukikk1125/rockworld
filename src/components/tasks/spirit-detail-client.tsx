"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { TaskSelectDialog } from "@/components/tasks/task-select-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  addNormalCount,
  addPollutionCount,
  archiveTargetShiny,
  getSpiritSummary,
  hasTaskData,
} from "@/lib/calculations";
import { buildDirectedPlan, createTaskFromPlan, getPlanById, plans } from "@/lib/task-factory";
import { getTaskById, getTasks, saveShinyArchiveRecord, saveTask, setCurrentTask } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { Task } from "@/types";

type QuickAction = "pollution" | "normal" | "shiny";

export function SpiritDetailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<QuickAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const spiritId = searchParams.get("spiritId") ?? searchParams.get("id") ?? "";
  const summary = useMemo(
    () => getSpiritSummary(spiritId),
    [spiritId, refreshKey],
  );

  const candidatePlans = useMemo(() => {
    if (!summary) return [];
    return plans.filter(
      (plan) => plan.targetSpiritIds.includes(summary.spirit.id) || plan.isDirected,
    );
  }, [summary]);

  const activeTasks = useMemo(
    () => getTasks().filter((task) => hasTaskData(task)),
    [refreshKey],
  );

  function refresh() {
    setRefreshKey((value) => value + 1);
  }

  function runQuickAction(taskId: string, action: QuickAction) {
    if (!summary) return;
    const task = getTaskById(taskId);
    if (!task) return;

    let nextTask: Task = task;
    if (action === "pollution") nextTask = addPollutionCount(task, summary.spirit.id, 1);
    if (action === "normal") nextTask = addNormalCount(task, summary.spirit.id, 1);
    if (action === "shiny") {
      const result = archiveTargetShiny(task, summary.spirit);
      saveShinyArchiveRecord(result.archiveRecord);
      nextTask = result.task;
    }

    saveTask(nextTask);
    setCurrentTask(nextTask.id);
    refresh();
  }

  function handleQuickAction(action: QuickAction) {
    if (!summary) return;
    if (activeTasks.length === 0) {
      setNotice("当前没有进行中的任务，请先从首页创建任务。");
      return;
    }

    if (activeTasks.length === 1) {
      runQuickAction(activeTasks[0].id, action);
      return;
    }

    setPendingAction(action);
    setTaskDialogOpen(true);
  }

  function restartFromPlan(planId: string) {
    if (!summary) return;

    const matchedPlan = getPlanById(planId);
    const plan = matchedPlan?.isDirected ? buildDirectedPlan(summary.spirit) : matchedPlan;
    if (!plan) return;

      const existing = getTasks().find((task) => task.planId === plan.id);
      if (existing) {
        setCurrentTask(existing.id);
        router.push(`/tasks/view?taskId=${encodeURIComponent(existing.id)}`);
        return;
      }

    const nextTask = createTaskFromPlan(plan, {
      taskName: plan.isDirected ? `${summary.spirit.name}定向刷取` : plan.planName,
    });
    saveTask(nextTask);
    setCurrentTask(nextTask.id);
    router.push(`/tasks/view?taskId=${encodeURIComponent(nextTask.id)}`);
  }

  if (!summary) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">未找到该精灵的详情数据。</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="overflow-hidden bg-gradient-to-br from-white via-amber-50 to-emerald-50 p-4">
          <div className="flex items-start gap-4">
            <PetImage
              src={summary.spirit.image}
              alt={summary.spirit.name}
              className="h-20 w-20 rounded-full border-2 border-emerald-200"
            />
            <div className="flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">精灵详情</Badge>
                {summary.shinyCount > 0 && <Badge className="bg-primary/10 text-primary">已拥有</Badge>}
              </div>
              <h2 className="mt-2 text-2xl font-black">{summary.spirit.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">总异色：{summary.shinyCount}</p>
              {summary.latestShinyAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  最近获得：{formatDateTime(summary.latestShinyAt)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => handleQuickAction("pollution")}>
              污染 +1
            </Button>
            <Button className="bg-sky-500 text-white hover:bg-sky-600" onClick={() => handleQuickAction("normal")}>
              原色 +1
            </Button>
            <Button className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={() => handleQuickAction("shiny")}>
              异色 +1
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-black">按任务来源拆分</h3>
          <div className="mt-3 grid gap-3">
            {summary.tasks.length > 0 ? (
              summary.tasks.map((task) => (
                <div key={task.taskId} className="rounded-2xl bg-white/85 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black">{task.taskName}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{task.planName}</div>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">{task.mode}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-muted/40 p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">污染</div>
                      <div className="text-sm font-black text-rose-600">{task.pollutionCount}</div>
                    </div>
                    <div className="rounded-2xl bg-muted/40 p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">原色</div>
                      <div className="text-sm font-black text-sky-600">{task.normalCount}</div>
                    </div>
                    <div className="rounded-2xl bg-muted/40 p-2 text-center">
                      <div className="text-[10px] text-muted-foreground">异色</div>
                      <div className="text-sm font-black text-emerald-600">{task.shinyCount}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">还没有与该精灵相关的任务记录。</p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-black">抓取方案</h3>
          <div className="mt-3 grid gap-3">
            {candidatePlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl bg-white/85 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black">
                      {plan.isDirected ? `${summary.spirit.name}定向刷取` : plan.planName}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{plan.fruitRecipe}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{plan.description}</div>
                  </div>
                  <Badge className={plan.isDirected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                    {plan.planMode}
                  </Badge>
                </div>
                <Button className="mt-4 w-full" onClick={() => restartFromPlan(plan.id)}>
                  重新记录
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <TaskSelectDialog
        open={taskDialogOpen}
        tasks={activeTasks}
        title="选择归属任务"
        onClose={() => {
          setTaskDialogOpen(false);
          setPendingAction(null);
        }}
        onSelect={(taskId) => {
          if (!pendingAction) return;
          runQuickAction(taskId, pendingAction);
          setTaskDialogOpen(false);
          setPendingAction(null);
        }}
      />

      <ConfirmDialog
        open={!!notice}
        title="提示"
        description={notice ?? ""}
        confirmText="我知道了"
        hideCancel
        confirmVariant="default"
        onCancel={() => setNotice(null)}
        onConfirm={() => setNotice(null)}
      />
    </>
  );
}
