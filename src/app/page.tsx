"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { createTaskFromPreset, petPresets } from "@/lib/task-factory";
import { getCurrentTask, getTasks, saveTask, setCurrentTask } from "@/lib/storage";
import { PetPreset, Task } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [currentTask, setCurrentTaskState] = useState<Task>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PetPreset | null>(null);

  useEffect(() => {
    setCurrentTaskState(getCurrentTask());
    setTasks(getTasks());
  }, []);

  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const completedCountByPet = useMemo(() => tasks.reduce<Record<string, number>>((acc, task) => {
    if (!task.completed) return acc;
    acc[task.petName] = (acc[task.petName] ?? 0) + 1;
    return acc;
  }, {}), [tasks]);
  const obtainedTotal = useMemo(() => Object.values(completedCountByPet).reduce((sum, count) => sum + count, 0), [completedCountByPet]);

  function handleConfirmPet() {
    if (!selectedPreset) return;
    const existing = activeTasks.find((task) => task.petName === selectedPreset.petName);
    if (existing) {
      setCurrentTask(existing.id);
      setSelectedPreset(null);
      router.push(`/tasks/${existing.id}`);
      return;
    }

    const nextTask = createTaskFromPreset(selectedPreset);
    saveTask(nextTask);
    setCurrentTask(nextTask.id);
    setSelectedPreset(null);
    router.push(`/tasks/${nextTask.id}`);
  }

  return (
    <PageShell title="异色精灵记录台">
      {!currentTask ? (
        <div className="space-y-2">
          <Card className="bg-gradient-to-br from-white via-amber-50 to-rose-50 p-4 text-center">
            <h3 className="text-lg font-black">还没有进行中的任务</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">从下方选择一个异色精灵开始记录</p>
            <Button size="lg" className="mt-3 h-9 w-full rounded-xl text-xs" onClick={() => router.push("/history")}>
              查看历史记录
            </Button>
          </Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black">快速选择</h2>
            <Badge className="bg-white/75 text-[9px] text-foreground">已获取 {obtainedTotal}</Badge>
          </div>
          <PetPickerGrid presets={petPresets} completedCountByPet={completedCountByPet} onPick={setSelectedPreset} />
        </div>
      ) : (
        <div className="space-y-2">
          <Card className="overflow-hidden bg-gradient-to-br from-white via-rose-50 to-amber-50 p-3">
            <div className="grid grid-cols-[64px_1fr] gap-2.5">
              <PetImage src={currentTask.image} alt={currentTask.petName} className="aspect-square w-full rounded-[16px]" priority />
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1">
                  <Badge className="bg-rose-100 text-[9px] text-rose-700">{currentTask.petType}</Badge>
                  <Badge className="bg-amber-100 text-[9px] text-amber-700">{currentTask.mode}</Badge>
                  <Badge className="bg-emerald-100 text-[9px] text-emerald-700">{currentTask.shinyStatus}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight">{currentTask.petName}</h3>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{currentTask.familyOrType}</p>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <MiniMetric label="破盾" value={`${currentTask.shieldBreakCount}`} />
                  <MiniMetric label="保底" value={`${currentTask.pityRemaining}`} />
                  <MiniMetric label="普通" value={`${currentTask.normalCaughtCount}`} />
                  <MiniMetric label="球耗" value={`${currentTask.estimatedBallCost}`} />
                </div>
              </div>
            </div>
            <Button size="lg" className="mt-2.5 h-9 w-full rounded-xl text-xs" onClick={() => { setCurrentTask(currentTask.id); router.push(`/tasks/${currentTask.id}`); }}>
              进入记录界面
            </Button>
          </Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-black">快速选择</h2>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/75 text-[9px] text-foreground">进行中 {activeTasks.length}</Badge>
              <Badge className="bg-emerald-50 text-[9px] text-emerald-700">已获取 {obtainedTotal}</Badge>
            </div>
          </div>
          <PetPickerGrid presets={petPresets} completedCountByPet={completedCountByPet} onPick={setSelectedPreset} />
        </div>
      )}

      {selectedPreset && (
        <PetConfirmDialog
          preset={selectedPreset}
          hasActiveTask={activeTasks.some((task) => task.petName === selectedPreset.petName)}
          obtainedCount={completedCountByPet[selectedPreset.petName] ?? 0}
          onConfirm={handleConfirmPet}
          onCancel={() => setSelectedPreset(null)}
        />
      )}
    </PageShell>
  );
}

function PetPickerGrid({ presets, completedCountByPet, onPick }: { presets: PetPreset[]; completedCountByPet: Record<string, number>; onPick: (preset: PetPreset) => void; }) {
  return (
    <div className="grid grid-cols-4 gap-4 p-2">
      {presets.map((preset) => {
        const obtainedCount = completedCountByPet[preset.petName] ?? 0;
        const isObtained = obtainedCount > 0;
        
        return (
          <button key={preset.petName} type="button" onClick={() => onPick(preset)} className="transition-transform hover:-translate-y-1 hover:scale-105">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <PetImage src={preset.image} alt={preset.petName} className="aspect-square w-16 h-16 rounded-full" />
                {isObtained && <span className="absolute -right-2 -top-2 flex min-w-6 items-center justify-center rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-black text-white shadow-md">{obtainedCount}</span>}
              </div>
              <p className="line-clamp-1 text-[9px] font-bold text-gray-700 text-center w-full">{preset.petName}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PetConfirmDialog({ preset, hasActiveTask, obtainedCount, onConfirm, onCancel }: { preset: PetPreset; hasActiveTask: boolean; obtainedCount: number; onConfirm: () => void; onCancel: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <Card className="w-full max-w-xs border-border/80 bg-white p-5 shadow-lg">
        <div className="flex flex-col items-center gap-3">
          <PetImage src={preset.image} alt={preset.petName} className="aspect-square w-20 rounded-[20px]" />
          <div className="text-center">
            <h3 className="text-base font-black">{preset.petName}</h3>
            <div className="mt-1 flex flex-wrap justify-center gap-1">
              <Badge className="bg-rose-100 text-[9px] text-rose-700">{preset.petType}</Badge>
              <Badge className="bg-amber-100 text-[9px] text-amber-700">{preset.recommendedMode}</Badge>
              {obtainedCount > 0 && <Badge className="bg-emerald-100 text-[9px] text-emerald-700">已获取 {obtainedCount}</Badge>}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-[11px] text-muted-foreground">
          <InfoRow label="系别" value={preset.familyOrType} />
          <InfoRow label="抓取点位" value={preset.spawnLocation} />
          <InfoRow label="精灵果实" value={preset.fruitInfo} />
          {preset.recommendedMode === "3×3混抓法" && (
            <>
              <InfoRow label="A 系搭配" value={preset.aPet} />
              <InfoRow label="B 系搭配" value={preset.bPet} />
            </>
          )}
        </div>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="h-9 flex-1 rounded-xl text-xs" onClick={onCancel}>取消</Button>
          <Button className="h-9 flex-1 rounded-xl text-xs" onClick={onConfirm}>{hasActiveTask ? "进入任务" : "开始记录"}</Button>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <div className="flex gap-2"><span className="shrink-0 font-semibold text-foreground">{label}</span><span>{value}</span></div>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[12px] bg-white/75 p-1 text-center"><div className="text-[8px] text-muted-foreground">{label}</div><div className="text-xs font-black">{value}</div></div>;
}
