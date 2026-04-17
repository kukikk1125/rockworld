"use client";

import { ReactNode, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PetInfoCard } from "@/components/tasks/pet-info-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createTaskFromPreset, petPresets } from "@/lib/task-factory";
import { saveTask } from "@/lib/storage";
import { Task, TaskMode } from "@/types";

export function TaskForm({ initialTask }: { initialTask?: Task }) {
  const router = useRouter();
  const defaultPresetIndex = initialTask ? petPresets.findIndex((preset) => preset.petName === initialTask.petName) : 0;
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(defaultPresetIndex >= 0 ? String(defaultPresetIndex) : "0");
  const selectedPreset = petPresets[Number(selectedPresetIndex)];
  const [form, setForm] = useState<Task>(initialTask ?? createTaskFromPreset(selectedPreset));

  const previewTask = useMemo(() => form, [form]);

  function applyPreset(index: string) {
    const preset = petPresets[Number(index)];
    setSelectedPresetIndex(index);
    setForm((prev) =>
      createTaskFromPreset(preset, {
        ...prev,
        id: prev.id,
        createdAt: prev.createdAt,
        updatedAt: prev.updatedAt,
        completed: prev.completed,
      }),
    );
  }

  function handleSave() {
    saveTask({ ...form, updatedAt: new Date().toISOString() });
    router.push(`/tasks/${form.id}`);
  }

  return (
    <div className="grid gap-5">
      <Card className="bg-white/88 p-5">
        <div className="mb-5 rounded-[24px] bg-gradient-to-r from-rose-100 to-amber-100 p-4">
          <h2 className="text-lg font-black">轻量编辑</h2>
          <p className="mt-1 text-sm text-muted-foreground">这里保留微调入口，但日常使用更推荐直接回首页点宠物开始记录。</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="宠物预设">
            <Select value={selectedPresetIndex} onChange={(e) => applyPreset(e.target.value)}>
              {petPresets.map((preset, index) => (
                <option key={preset.petName} value={index}>
                  {preset.petName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="抓取模式">
            <Select value={form.mode} onChange={(e) => setForm((prev) => ({ ...prev, mode: e.target.value as TaskMode }))}>
              <option value="定向单刷法">定向单刷法</option>
              <option value="3×3混抓法">3×3混抓法</option>
              <option value="无需刷取">无需刷取</option>
            </Select>
          </Field>
          <Field label="宠物名称">
            <Input value={form.petName} onChange={(e) => setForm((prev) => ({ ...prev, petName: e.target.value }))} />
          </Field>
          <Field label="宠物类型">
            <Select value={form.petType} onChange={(e) => setForm((prev) => ({ ...prev, petType: e.target.value as Task["petType"] }))}>
              <option value="常驻">常驻</option>
              <option value="赛季限定">赛季限定</option>
              <option value="战令/活动">战令/活动</option>
            </Select>
          </Field>
          <Field label="所属系别/类型">
            <Input value={form.familyOrType} onChange={(e) => setForm((prev) => ({ ...prev, familyOrType: e.target.value }))} />
          </Field>
          <Field label="图片路径">
            <Input value={form.image ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} />
          </Field>
          <Field label="A 系搭配">
            <Input value={form.aPet ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, aPet: e.target.value }))} />
          </Field>
          <Field label="B 系搭配">
            <Input value={form.bPet ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, bPet: e.target.value }))} />
          </Field>
          <Field label="抓取点位">
            <Input value={form.spawnLocation ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, spawnLocation: e.target.value }))} />
          </Field>
          <Field label="精灵果实">
            <Input value={form.fruitInfo ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, fruitInfo: e.target.value }))} />
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-12 flex-1 rounded-2xl" onClick={handleSave}>保存修改</Button>
          <Button variant="outline" size="lg" className="h-12 flex-1 rounded-2xl" onClick={() => router.push(`/tasks/${form.id}`)}>
            返回任务页
          </Button>
        </div>
      </Card>

      <PetInfoCard task={previewTask} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}
