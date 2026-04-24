"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  getTaskSpiritMarks,
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
import { ProgressMarkType, Spirit, Task, TaskSpiritRecord } from "@/types";

type CardFeedback =
  | {
      spiritId: string;
      action: "pollution" | "normal";
      flashIndex: number;
      notice: string;
    }
  | {
      spiritId: string;
      action: "shiny" | "undo";
      notice: string;
    };

function ProgressGrid({
  record,
  feedback,
}: {
  record: TaskSpiritRecord;
  feedback: CardFeedback | null;
}) {
  const marks = getTaskSpiritMarks(record);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 80 }).map((_, index) => {
          const mark = marks[index];
          const className =
            mark === "pollution"
              ? "bg-rose-500"
              : mark === "normal"
                ? "bg-sky-500"
                : "bg-white/90";
          const isFlash =
            feedback?.spiritId === record.spiritId &&
            "flashIndex" in feedback &&
            feedback.flashIndex === index;

          return (
            <span
              key={index}
              className={`h-3 rounded-[4px] border border-white/60 transition-all duration-300 ${className} ${
                isFlash ? "scale-125 ring-2 ring-amber-300" : ""
              }`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <div className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
          当前进度 {marks.length}/80
        </div>
        {marks.length >= 80 && (
          <span className="text-[11px] font-bold text-emerald-600">已到保底</span>
        )}
      </div>
    </div>
  );
}

function SpiritRecordCard({
  spirit,
  record,
  totalShinyCount,
  feedback,
  onPollution,
  onNormal,
  onShiny,
  onUndo,
}: {
  spirit?: Spirit;
  record: TaskSpiritRecord;
  totalShinyCount: number;
  feedback: CardFeedback | null;
  onPollution: () => void;
  onNormal: () => void;
  onShiny: () => void;
  onUndo: () => void;
}) {
  const progress = getTaskSpiritProgress(record);
  const avatarRing =
    totalShinyCount > 0
      ? "border-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
      : "border-amber-200";
  const isCurrentFeedback = feedback?.spiritId === record.spiritId ? feedback : null;

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
                <Badge className="bg-white/80 text-slate-700">记录中</Badge>
                {progress >= 80 && (
                  <Badge className="bg-emerald-100 text-emerald-700">保底就绪</Badge>
                )}
                {record.currentShinyCount > 0 && (
                  <Badge className="bg-primary/10 text-primary">本轮异色 {record.currentShinyCount}</Badge>
                )}
              </div>
              <h3 className="mt-2 text-lg font-black">{spirit?.name ?? record.spiritId}</h3>
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

        <ProgressGrid record={record} feedback={isCurrentFeedback} />

        {isCurrentFeedback && (
          <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white">
            {isCurrentFeedback.notice}
          </div>
        )}

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

        <div className="grid grid-cols-2 gap-2">
          <Button
            className={`bg-rose-500 text-white hover:bg-rose-600 ${
              isCurrentFeedback?.action === "pollution" ? "scale-[0.98]" : ""
            }`}
            onClick={onPollution}
          >
            污染 +1
          </Button>
          <Button
            className={`bg-sky-500 text-white hover:bg-sky-600 ${
              isCurrentFeedback?.action === "normal" ? "scale-[0.98]" : ""
            }`}
            onClick={onNormal}
          >
            原色 +1
          </Button>
        </div>

        <Button
          size="lg"
          className={`w-full bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.28)] hover:bg-emerald-600 ${
            isCurrentFeedback?.action === "shiny" ? "scale-[0.99]" : ""
          }`}
          onClick={onShiny}
        >
          确认异色
        </Button>
      </div>
    </Card>
  );
}

export function PlanRecordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [task, setTask] = useState<Task | null>(null);
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<CardFeedback | null>(null);

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

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 900);
    return () => window.clearTimeout(timer);
  }, [feedback]);

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
    const nextTask = addPollutionCount(task, spiritId, 1);
    const nextRecord = nextTask.spiritRecords.find((item) => item.spiritId === spiritId);
    persist(nextTask);
    if (nextRecord?.progressMarks?.length) {
      setFeedback({
        spiritId,
        action: "pollution",
        flashIndex: nextRecord.progressMarks.length - 1,
        notice: "已记录：污染 +1",
      });
    }
  }

  function handleNormal(spiritId: string) {
    if (!task) return;
    const nextTask = addNormalCount(task, spiritId, 1);
    const nextRecord = nextTask.spiritRecords.find((item) => item.spiritId === spiritId);
    persist(nextTask);
    if (nextRecord?.progressMarks?.length) {
      setFeedback({
        spiritId,
        action: "normal",
        flashIndex: nextRecord.progressMarks.length - 1,
        notice: "已记录：原色 +1",
      });
    }
  }

  function handleShiny(record: TaskSpiritRecord) {
    if (!task) return;
    const spirit = spirits.find((item) => item.id === record.spiritId);
    if (!spirit) return;

    const result = archiveTargetShiny(task, spirit);
    saveShinyArchiveRecord(result.archiveRecord);
    persist(result.task);
    setFeedback({
      spiritId: record.spiritId,
      action: "shiny",
      notice: "已确认异色，当前轮次已存档并自动进入下一轮。",
    });
    setToast("异色已存档");
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
    setToast("已记录意外异色，仅进入存档，不加入当前卡片区。");
  }

  function handleUndo(spiritId: string) {
    if (!task) return;
    const result = undoSpiritLastAction(task, spiritId);
    if (result.removedArchiveId) {
      removeArchiveRecord(result.removedArchiveId);
    }
    persist(result.task);
    setFeedback({
      spiritId,
      action: "undo",
      notice: "已撤销上一步",
    });
    setToast("已撤销上一步");
  }

  if (!task) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">没有找到对应任务，可能是链接失效或任务已被删除。</p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="outline" onClick={() => router.push("/")}>
            返回首页
          </Button>
          <Button onClick={() => router.push("/history")}>返回记录页</Button>
        </div>
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
              </div>
            </div>

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
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black">精灵记录区</h3>
            </div>
            <Button variant="outline" onClick={() => setPickerOpen(true)}>
              记录意外异色
            </Button>
          </div>

          <div className="grid gap-3">
            {spiritRecords.map((record) => (
              <SpiritRecordCard
                key={record.spiritId}
                spirit={spirits.find((item) => item.id === record.spiritId)}
                record={record}
                totalShinyCount={getSpiritGlobalShinyCount(record.spiritId)}
                feedback={feedback}
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
        title="记录意外异色"
        description="用于记录当前任务中意外遇到的异色。该操作只进入异色存档，不加入当前任务卡片区。"
        spirits={spirits}
        allowCreate
        onClose={() => setPickerOpen(false)}
        onSelect={handleUnexpectedShiny}
      />
    </>
  );
}
