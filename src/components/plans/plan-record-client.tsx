"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { SpiritPickerDialog } from "@/components/tasks/spirit-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  addNormalCount,
  addPollutionCount,
  archiveTargetShiny,
  createUnexpectedShinyArchiveRecord,
  getSpiritGlobalShinyCount,
  getTaskSpiritProgress,
  getTaskSpiritRecords,
  removeArchiveRecord,
  undoSpiritLastAction,
} from "@/lib/calculations";
import { getPlanById, getSpiritsByIds } from "@/lib/task-factory";
import {
  getSpirits,
  getTaskById,
  saveShinyArchiveRecord,
  saveTask,
  setCurrentTask,
  upsertSpirit,
} from "@/lib/storage";
import { Spirit, Task, TaskSpiritRecord } from "@/types";

function ProgressGrid({ record }: { record: TaskSpiritRecord }) {
  const pollution = record.pollutionCount;
  const normal = record.normalCount;
  const total = Math.min(80, pollution + normal);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 80 }).map((_, index) => {
          let className = "bg-white/90";
          if (index < pollution) className = "bg-rose-500";
          if (index >= pollution && index < total) className = "bg-sky-500";

          return (
            <span
              key={index}
              className={`h-3 rounded-[4px] border border-white/60 ${className}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>保底进度 {pollution + normal}/80</span>
        {pollution + normal >= 80 && (
          <span className="font-bold text-emerald-600">已达保底</span>
        )}
      </div>
    </div>
  );
}

function SpiritRecordCard({
  spirit,
  record,
  totalShinyCount,
  onPollution,
  onNormal,
  onShiny,
  onUndo,
}: {
  spirit?: Spirit;
  record: TaskSpiritRecord;
  totalShinyCount: number;
  onPollution: () => void;
  onNormal: () => void;
  onShiny: () => void;
  onUndo: () => void;
}) {
  const progress = getTaskSpiritProgress(record);
  const avatarRing =
    totalShinyCount > 0 ? "border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" : "border-amber-200";

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white via-amber-50/70 to-rose-50/60 p-4">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <PetImage
                src={spirit?.image}
                alt={spirit?.name ?? record.spiritId}
                className={`h-16 w-16 rounded-full border-2 ${avatarRing}`}
              />
              {totalShinyCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-white">
                  {totalShinyCount}
                </span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/80 text-slate-700">进行中</Badge>
                {progress >= 80 && (
                  <Badge className="bg-emerald-100 text-emerald-700">保底就绪</Badge>
                )}
              </div>
              <h3 className="mt-2 text-lg font-black">{spirit?.name ?? record.spiritId}</h3>
              <p className="text-xs text-muted-foreground">
                头像角标表示全局累计异色次数，本轮记录仍以当前卡片为准。
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onUndo}
            disabled={!record.lastAction}
            className="text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            撤销上一步
          </button>
        </div>

        <ProgressGrid record={record} />

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-white/80 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">污染数量</div>
            <div className="text-base font-black text-rose-600">{record.pollutionCount}</div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">原色数量</div>
            <div className="text-base font-black text-sky-600">{record.normalCount}</div>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-center">
            <div className="text-[10px] text-muted-foreground">本轮异色</div>
            <div className="text-base font-black text-emerald-600">{record.currentShinyCount}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button className="bg-rose-500 text-white hover:bg-rose-600" onClick={onPollution}>
            污染 +1
          </Button>
          <Button className="bg-sky-500 text-white hover:bg-sky-600" onClick={onNormal}>
            原色 +1
          </Button>
          <Button className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={onShiny}>
            异色 +1
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PlanRecordClient() {
  const searchParams = useSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const taskId = searchParams.get("taskId") ?? searchParams.get("id") ?? "";

  useEffect(() => {
    const matched = getTaskById(taskId);
    if (!matched) return;
    setTask(matched);
    setSpirits(getSpirits());
    setCurrentTask(matched.id);
  }, [taskId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const plan = useMemo(() => (task ? getPlanById(task.planId) : undefined), [task]);
  const targetSpirits = useMemo(
    () => (task ? getSpiritsByIds(task.targetSpiritIds) : []),
    [task],
  );
  const spiritRecords = useMemo(
    () => (task ? getTaskSpiritRecords(task) : []),
    [task],
  );

  function persist(nextTask: Task) {
    setTask(nextTask);
    saveTask(nextTask);
    setSpirits(getSpirits());
  }

  function handlePollution(spiritId: string) {
    if (!task) return;
    persist(addPollutionCount(task, spiritId, 1));
  }

  function handleNormal(spiritId: string) {
    if (!task) return;
    persist(addNormalCount(task, spiritId, 1));
  }

  function handleShiny(record: TaskSpiritRecord) {
    if (!task) return;
    const spirit = spirits.find((item) => item.id === record.spiritId);
    if (!spirit) return;

    const result = archiveTargetShiny(task, spirit);
    saveShinyArchiveRecord(result.archiveRecord);
    persist(result.task);
    setToast("已存档，已开始新一轮记录");
  }

  function handleUnexpectedShiny(payload: { spirit: Spirit; created: boolean }) {
    if (!task) return;

    const spirit = payload.created
      ? upsertSpirit({ name: payload.spirit.name, image: payload.spirit.image })
      : payload.spirit;

    saveShinyArchiveRecord(createUnexpectedShinyArchiveRecord(task, spirit));
    persist({
      ...task,
      hasStarted: true,
      updatedAt: new Date().toISOString(),
    });
    setPickerOpen(false);
    setToast("已存档为方案外异色");
  }

  function handleUndo(spiritId: string) {
    if (!task) return;
    const result = undoSpiritLastAction(task, spiritId);
    if (result.removedArchiveId) {
      removeArchiveRecord(result.removedArchiveId);
    }
    persist(result.task);
    setToast("已撤销上一步");
  }

  if (!task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">未找到对应任务。</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="overflow-hidden bg-gradient-to-br from-white via-amber-50 to-fuchsia-50 p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-amber-100 text-amber-700">{task.mode}</Badge>
                  <Badge className="bg-white/80 text-slate-700">任务记录页</Badge>
                </div>
                <h2 className="mt-2 text-xl font-black">{task.taskName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{task.fruitRecipe}</p>
                {plan?.description && (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{plan.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                {targetSpirits.map((spirit) => (
                  <div key={spirit.id} className="flex flex-col items-center gap-1">
                    <PetImage
                      src={spirit.image}
                      alt={spirit.name}
                      className="h-12 w-12 rounded-full border-2 border-amber-200"
                    />
                    <span className="max-w-[52px] text-center text-[10px] font-medium">
                      {spirit.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" onClick={() => setPickerOpen(true)}>
                补记方案外异色
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-black">精灵卡片区</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              异色存档后，当前卡片不会消失，而是自动清零并进入下一轮记录。
            </p>
          </div>

          <div className="grid gap-3">
            {spiritRecords.map((record) => (
              <SpiritRecordCard
                key={record.spiritId}
                spirit={spirits.find((item) => item.id === record.spiritId)}
                record={record}
                totalShinyCount={getSpiritGlobalShinyCount(record.spiritId)}
                onPollution={() => handlePollution(record.spiritId)}
                onNormal={() => handleNormal(record.spiritId)}
                onShiny={() => handleShiny(record)}
                onUndo={() => handleUndo(record.spiritId)}
              />
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-[120] flex justify-center px-4">
          <div className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}

      <SpiritPickerDialog
        open={pickerOpen}
        title="方案外异色存档"
        description="用于记录当前任务里意外抓到的异色。该记录只进入存档事件，不加入当前任务卡片区。"
        spirits={spirits}
        allowCreate
        onClose={() => setPickerOpen(false)}
        onSelect={handleUnexpectedShiny}
      />
    </>
  );
}
