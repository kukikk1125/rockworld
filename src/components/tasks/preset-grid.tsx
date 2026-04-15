"use client";

import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PetPreset, Task } from "@/types";

export function PresetGrid({
  presets,
  activeTasks,
  onPick,
}: {
  presets: PetPreset[];
  activeTasks: Task[];
  onPick: (preset: PetPreset) => void;
}) {
  return (
    <div className="grid gap-4">
      {presets.map((preset) => {
        const activeTask = activeTasks.find(
          (task) => !task.completed && task.petName === preset.petName,
        );

        return (
          <Card
            key={preset.petName}
            className="overflow-hidden border-white/60 bg-white/88 p-0 backdrop-blur"
          >
            <div className="grid gap-3 p-3.5">
              <PetImage
                src={preset.image}
                alt={preset.petName}
                className="aspect-[179/100] w-full rounded-[22px]"
              />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-rose-100 text-rose-700">{preset.petType}</Badge>
                  <Badge className="bg-amber-100 text-amber-700">
                    {preset.recommendedMode}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-[17px] font-black leading-6">
                    {preset.petName}
                  </h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {preset.familyOrType}
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/55 p-3 text-[13px] leading-5">
                  <p>刷取点位：{preset.spawnLocation}</p>
                  <p className="mt-1">果实：{preset.fruitInfo}</p>
                </div>
                <Button
                  size="lg"
                  className="h-[52px] w-full rounded-2xl text-[15px] font-black"
                  onClick={() => onPick(preset)}
                >
                  {activeTask ? "继续记录" : "点我开始记录"}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
