"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageShell } from "@/components/ui/page-shell";
import { PetImage } from "@/components/tasks/pet-image";
import {
  buildDirectedPlan,
  createTaskFromPlan,
  getSpiritsByIds,
  plans,
  spiritCatalog,
} from "@/lib/task-factory";
import {
  getOwnedSpiritIds,
  isTaskInProgress,
  getTaskArchiveCount,
  getTotalNormalCount,
  getTotalPollutionCount,
} from "@/lib/calculations";
import { deleteTask, getTasks, saveTask, setCurrentTask } from "@/lib/storage";
import { PlanPreset, Spirit, Task } from "@/types";

function PlanTargets({ spiritIds }: { spiritIds: string[] }) {
  const spirits = getSpiritsByIds(spiritIds);
  const display = spirits.slice(0, 4);

  return (
    <div className="flex flex-wrap gap-3">
      {display.map((spirit) => (
        <div key={spirit.id} className="flex flex-col items-center gap-1">
          <PetImage
            src={spirit.image}
            alt={spirit.name}
            className="h-14 w-14 rounded-full border-2 border-amber-200"
          />
          <span className="max-w-[64px] text-center text-[10px] font-medium">
            {spirit.name}
          </span>
        </div>
      ))}
      {spiritIds.length > display.length && (
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-amber-300 bg-white text-[10px] font-bold text-amber-700">
            +{spiritIds.length - display.length}
          </div>
          <span className="text-[10px] font-medium text-amber-700">更多</span>
        </div>
      )}
    </div>
  );
}

function ActiveTaskCard({
  task,
  onSelect,
  onDelete,
}: {
  task: Task;
  onSelect: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(task);
        }
      }}
      className="w-full text-left transition-transform hover:scale-[1.01]"
    >
      <Card className="overflow-hidden border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-0">
        <div className="grid gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">进行中</Badge>
                <Badge className="bg-amber-100 text-amber-700">{task.mode}</Badge>
              </div>
              <div>
                <h3 className="text-[18px] font-black text-emerald-950">{task.taskName}</h3>
                <p className="mt-1 text-[13px] text-muted-foreground">{task.fruitRecipe}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task);
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">污染</div>
              <div className="text-sm font-black text-rose-600">{getTotalPollutionCount(task)}</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">原色</div>
              <div className="text-sm font-black text-sky-600">{getTotalNormalCount(task)}</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">异色成果</div>
              <div className="text-sm font-black text-emerald-600">{getTaskArchiveCount(task.id)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PlanCard({
  plan,
  activeTask,
  onStart,
}: {
  plan: PlanPreset;
  activeTask?: Task;
  onStart: (plan: PlanPreset) => void;
}) {
  return (
    <Card className="overflow-hidden bg-white/90 p-0">
      <div className="grid gap-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={plan.isDirected ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
            {plan.isDirected ? "定向入口" : "3×3 混抓"}
          </Badge>
          <Badge className="bg-slate-100 text-slate-700">{plan.planMode}</Badge>
          {activeTask && <Badge className="bg-emerald-100 text-emerald-700">已有记录</Badge>}
        </div>

        <div>
          <h3 className="text-[18px] font-black">{plan.planName}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.fruitRecipe}</p>
        </div>

        <PlanTargets spiritIds={plan.targetSpiritIds} />

        <div className="flex items-center justify-between gap-3">
          <div />
          <Button onClick={() => onStart(plan)}>
            {activeTask ? "继续记录" : "开始记录"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [directedOpen, setDirectedOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const activeTasks = useMemo(() => tasks.filter((task) => isTaskInProgress(task)), [tasks]);
  const ownedCount = useMemo(() => getOwnedSpiritIds().size, [tasks]);
  const directedPlan = useMemo(() => plans.find((item) => item.isDirected), []);
  const mixedPlans = useMemo(() => plans.filter((item) => !item.isDirected), []);

  function refreshTasks() {
    setTasks(getTasks());
  }

  function openTask(task: Task) {
    setCurrentTask(task.id);
    router.push(`/tasks/view?taskId=${encodeURIComponent(task.id)}`);
  }

  function startPlan(plan: PlanPreset) {
    if (plan.isDirected) {
      setDirectedOpen(true);
      return;
    }

    const existing = tasks.find((task) => task.planId === plan.id);
    if (existing) {
      openTask(existing);
      return;
    }

    const task = createTaskFromPlan(plan);
    saveTask(task);
    setNotice("已创建任务，开始记录后它会出现在“进行中任务”里。");
    openTask(task);
  }

  function startDirected(spirit: Spirit) {
    const plan = buildDirectedPlan(spirit);
    const existing = tasks.find((task) => task.planId === plan.id);
    if (existing) {
      setDirectedOpen(false);
      openTask(existing);
      return;
    }

    const task = createTaskFromPlan(plan, {
      taskName: `${spirit.name}定向刷取`,
    });
    saveTask(task);
    setDirectedOpen(false);
    setNotice("已创建任务，开始记录后它会出现在“进行中任务”里。");
    openTask(task);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    refreshTasks();
  }

  return (
    <PageShell title="异色精灵记录台">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black">任务启动总览</h2>
          <Badge className="bg-emerald-50 text-emerald-700">已拥有异色 {ownedCount}</Badge>
        </div>

        {activeTasks.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-emerald-700">进行中任务</h3>
              <Badge className="bg-emerald-100 text-emerald-700">{activeTasks.length}</Badge>
            </div>
            <div className="grid gap-3">
              {activeTasks.map((task) => (
                <ActiveTaskCard
                  key={task.id}
                  task={task}
                  onSelect={openTask}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-muted-foreground">选择抓取方案</h3>
            </div>
          </div>

          {directedPlan && (
            <PlanCard
              plan={directedPlan}
              activeTask={tasks.find((task) => task.mode === "定向果实法")}
              onStart={startPlan}
            />
          )}

          <div className="grid gap-3">
            {mixedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                activeTask={tasks.find((task) => task.planId === plan.id)}
                onStart={startPlan}
              />
            ))}
          </div>
        </section>
      </div>

      {directedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <Card className="w-full max-w-md border-border/80 bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">选择定向精灵</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  所有精灵都可以通过对应的精灵果实进行定向刷取。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDirectedOpen(false)}
                className="rounded-xl border border-input px-3 py-2 text-sm"
              >
                关闭
              </button>
            </div>

            <div className="mt-4 grid max-h-[420px] grid-cols-4 gap-3 overflow-y-auto">
              {spiritCatalog.map((spirit) => (
                <button
                  key={spirit.id}
                  type="button"
                  onClick={() => startDirected(spirit)}
                  className="flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:bg-muted/50"
                >
                  <PetImage
                    src={spirit.image}
                    alt={spirit.name}
                    className="h-14 w-14 rounded-full border-2 border-amber-200"
                  />
                  <span className="text-[10px] font-medium text-center">{spirit.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除任务"
        description={`确定要删除“${deleteTarget?.taskName ?? ""}”吗？该操作只删除任务过程，不删除已经存档的异色成果。`}
        confirmText="删除任务"
        cancelText="取消"
        confirmVariant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!notice}
        title="提示"
        description={notice ?? ""}
        confirmText="知道了"
        hideCancel
        confirmVariant="default"
        onCancel={() => setNotice(null)}
        onConfirm={() => setNotice(null)}
      />
    </PageShell>
  );
}
