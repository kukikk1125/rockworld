"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { petPresets } from "@/lib/task-factory";
import { getTasks, saveTask, setCurrentTask } from "@/lib/storage";
import { PetPreset } from "@/types";

export default function PetsPage() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<PetPreset | null>(null);

  function handleSelectPet(preset: PetPreset) {
    const tasks = getTasks();
    const activeTasks = tasks.filter((task) => !task.completed);
    const existing = activeTasks.find((task) => task.petName === preset.petName);

    if (existing) {
      setCurrentTask(existing.id);
      router.push(`/tasks/${existing.id}`);
      return;
    }

    const { createTaskFromPreset } = require("@/lib/task-factory");
    const nextTask = createTaskFromPreset(preset);
    saveTask(nextTask);
    setCurrentTask(nextTask.id);
    router.push(`/tasks/${nextTask.id}`);
  }

  return (
    <>
      <PageShell title="精灵信息">
        <div className="grid grid-cols-4 gap-1">
          {petPresets.map((preset) => (
            <button
              key={preset.petName}
              type="button"
              onClick={() => setSelectedPreset(preset)}
              className="rounded-[12px] p-1 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center gap-0.5 text-center">
                <PetImage
                  src={preset.image}
                  thumbnailSrc={preset.thumbnailImage}
                  detailSrc={preset.detailImage}
                  alt={preset.petName}
                  className="aspect-square w-full max-w-[56px] rounded-full border-2 border-white shadow-sm"
                  type="thumbnail"
                />
                <p className="line-clamp-1 text-[8px] font-black leading-3">
                  {preset.petName}
                </p>
              </div>
            </button>
          ))}
        </div>
      </PageShell>

      {selectedPreset && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-[var(--phone-width)] rounded-[28px] bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex gap-3">
                <PetImage
                  src={selectedPreset.image}
                  thumbnailSrc={selectedPreset.thumbnailImage}
                  detailSrc={selectedPreset.detailImage}
                  alt={selectedPreset.petName}
                  className="aspect-square w-20 rounded-[20px]"
                  type="detail"
                />
                <div>
                  <h3 className="text-lg font-black">{selectedPreset.petName}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge className="bg-rose-100 text-rose-700 text-[9px]">
                      {selectedPreset.petType}
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 text-[9px]">
                      {selectedPreset.recommendedMode}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPreset(null)}
                className="rounded-full p-1.5 hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="rounded-[18px] bg-rose-50/60 p-3">
                <p className="text-xs text-muted-foreground">推荐刷取模式</p>
                <p className="text-sm font-medium">{selectedPreset.recommendedMode}</p>
              </div>
              {selectedPreset.aPet && (
                <div className="rounded-[18px] bg-sky-50/60 p-3">
                  <p className="text-xs text-muted-foreground">A系搭配</p>
                  <p className="text-sm font-medium">{selectedPreset.aPet}</p>
                </div>
              )}
              {selectedPreset.bPet && (
                <div className="rounded-[18px] bg-violet-50/60 p-3">
                  <p className="text-xs text-muted-foreground">B系搭配</p>
                  <p className="text-sm font-medium">{selectedPreset.bPet}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11 rounded-xl text-sm"
                onClick={() => setSelectedPreset(null)}
              >
                关闭
              </Button>
              <Button
                className="h-11 rounded-xl text-sm"
                onClick={() => {
                  handleSelectPet(selectedPreset);
                }}
              >
                开始抓取
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
