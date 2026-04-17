import presets from "@/data/petPresets.json";
import { hydrateTask } from "@/lib/calculations";
import { createId } from "@/lib/utils";
import { PetPreset, Task, TaskMode } from "@/types";

export const petPresets = presets as PetPreset[];

export function createTaskFromPreset(preset?: PetPreset, overrides?: Partial<Task>): Task {
  const now = new Date().toISOString();
  const mode = overrides?.mode ?? preset?.recommendedMode ?? ("定向单刷法" as TaskMode);

  return hydrateTask({
    id: overrides?.id ?? createId(),
    petName: overrides?.petName ?? preset?.petName ?? "",
    petType: overrides?.petType ?? preset?.petType ?? "常驻",
    familyOrType: overrides?.familyOrType ?? preset?.familyOrType ?? "",
    mode,
    aPet: overrides?.aPet ?? preset?.aPet ?? "",
    bPet: overrides?.bPet ?? preset?.bPet ?? "",
    aCaught: overrides?.aCaught ?? 0,
    bCaught: overrides?.bCaught ?? 0,
    cycleRounds: overrides?.cycleRounds ?? 0,
    currentCycleTarget: overrides?.currentCycleTarget ?? (mode === "3×3混抓法" ? "A" : undefined),
    shieldBreakCount: overrides?.shieldBreakCount ?? 0,
    pityRemaining: 80,
    isInShelter: overrides?.isInShelter ?? false,
    hasFruit: overrides?.hasFruit ?? true,
    normalCaughtCount: overrides?.normalCaughtCount ?? 0,
    estimatedNormalRemaining: 560,
    estimatedBallCost: 80,
    lastSwitchAt: overrides?.lastSwitchAt,
    shinyStatus: overrides?.shinyStatus ?? "未获取",
    spawnLocation: overrides?.spawnLocation ?? preset?.spawnLocation ?? "",
    fruitInfo: overrides?.fruitInfo ?? preset?.fruitInfo ?? "",
    image: overrides?.image ?? preset?.image ?? "",
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    completed: overrides?.completed ?? false,
    probabilityMarked: overrides?.probabilityMarked ?? false,
    actionHistory: overrides?.actionHistory ?? [],
  });
}
