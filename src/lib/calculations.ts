import { Task } from "@/types";

export function calcPityRemaining(shieldBreakCount: number) {
  return Math.max(80 - shieldBreakCount, 0);
}

export function calcCycleRounds(aCaught = 0, bCaught = 0) {
  return Math.floor((aCaught + bCaught) / 6);
}

export function calcEstimatedNormalRemaining(pityRemaining: number, normalCaughtCount: number) {
  return Math.max(pityRemaining * 7 - normalCaughtCount, 0);
}

export function calcEstimatedBallCost(pityRemaining: number) {
  return pityRemaining;
}

export function calcShinyStatus(
  shieldBreakCount: number,
  probabilityMarked?: boolean,
  completed?: boolean,
  existingShinyStatus?: Task["shinyStatus"],
) {
  if (completed) {
    return existingShinyStatus || (shieldBreakCount >= 80 ? "保底获取" : "概率获取");
  }
  if (shieldBreakCount >= 80) return "保底获取" as const;
  if (probabilityMarked) return "概率获取" as const;
  return "未获取" as const;
}

export function getCurrentCycleTarget(aCaught = 0, bCaught = 0) {
  const totalInRound = (aCaught + bCaught) % 6;
  return totalInRound < 3 ? ("A" as const) : ("B" as const);
}

export function getCycleProgress(aCaught = 0, bCaught = 0) {
  const totalInRound = (aCaught + bCaught) % 6;
  const aInRound = Math.min(totalInRound, 3);
  const bInRound = Math.max(totalInRound - 3, 0);

  return { aInRound, bInRound, totalInRound };
}

export function hydrateTask(task: Task): Task {
  const pityRemaining = calcPityRemaining(task.shieldBreakCount);
  const cycleRounds = calcCycleRounds(task.aCaught ?? 0, task.bCaught ?? 0);
  const currentCycleTarget =
    task.mode === "3×3混抓法" ? getCurrentCycleTarget(task.aCaught ?? 0, task.bCaught ?? 0) : undefined;

  return {
    ...task,
    actionHistory: task.actionHistory ?? [],
    pityRemaining,
    cycleRounds,
    currentCycleTarget,
    estimatedNormalRemaining: calcEstimatedNormalRemaining(pityRemaining, task.normalCaughtCount),
    estimatedBallCost: calcEstimatedBallCost(pityRemaining),
    shinyStatus: calcShinyStatus(task.shieldBreakCount, task.probabilityMarked, task.completed, task.shinyStatus),
  };
}
