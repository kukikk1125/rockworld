import planPresets from "@/data/planPresets.json";
import spiritPresets from "@/data/petPresets.json";
import { createId } from "@/lib/utils";
import { PlanPreset, Spirit, Task, TaskSpiritRecord } from "@/types";

export const spiritCatalog = spiritPresets as Spirit[];
export const plans = planPresets as PlanPreset[];

export function getSpiritById(spiritId: string) {
  return spiritCatalog.find((item) => item.id === spiritId);
}

export function getSpiritByName(name: string) {
  return spiritCatalog.find((item) => item.name === name);
}

export function getSpiritsByIds(spiritIds: string[]) {
  return spiritIds
    .map((spiritId) => getSpiritById(spiritId))
    .filter((item): item is Spirit => Boolean(item));
}

export function getPlanById(planId: string) {
  return plans.find((item) => item.id === planId);
}

export function buildDirectedPlan(spirit: Spirit): PlanPreset {
  return {
    id: `directed-${spirit.id}`,
    planName: `${spirit.name}定向刷取`,
    planMode: "定向果实法",
    fruitRecipe: `${spirit.name}果实`,
    description: `使用 ${spirit.name} 果实进行定向刷取。`,
    targetSpiritIds: [spirit.id],
    image: spirit.image,
    isDirected: false,
  };
}

function createSpiritRecords(spiritIds: string[]): TaskSpiritRecord[] {
  return spiritIds.map((spiritId) => ({
    spiritId,
    pollutionCount: 0,
    normalCount: 0,
    currentShinyCount: 0,
    progressMarks: [],
  }));
}

export function createTaskFromPlan(
  plan: PlanPreset,
  overrides?: Partial<Task>,
): Task {
  const now = new Date().toISOString();

  return {
    id: overrides?.id ?? createId(),
    taskName: overrides?.taskName ?? plan.planName,
    planId: overrides?.planId ?? plan.id,
    planName: overrides?.planName ?? plan.planName,
    mode: overrides?.mode ?? plan.planMode,
    fruitRecipe: overrides?.fruitRecipe ?? plan.fruitRecipe,
    targetSpiritIds: overrides?.targetSpiritIds ?? [...plan.targetSpiritIds],
    spiritRecords:
      overrides?.spiritRecords ?? createSpiritRecords(plan.targetSpiritIds),
    ballUsage: overrides?.ballUsage ?? 0,
    hasStarted: overrides?.hasStarted ?? false,
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
  };
}
