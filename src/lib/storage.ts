"use client";

import baseSpirits from "@/data/petPresets.json";
import { createTaskFromPlan, getSpiritByName } from "@/lib/task-factory";
import {
  AppStorage,
  ProgressMarkType,
  ShinyArchiveRecord,
  Spirit,
  Task,
  TaskSpiritRecord,
} from "@/types";

const STORAGE_KEY = "rockworld-shiny-tracker";

const fallbackData: AppStorage = {
  tasks: [],
  spirits: baseSpirits as Spirit[],
  shinyArchiveRecords: [],
  currentTaskId: undefined,
  theme: "light",
};

function buildLegacyProgressMarks(
  pollutionCount: number,
  normalCount: number,
): ProgressMarkType[] {
  return [
    ...Array.from({ length: Math.max(0, pollutionCount) }, () => "pollution" as const),
    ...Array.from({ length: Math.max(0, normalCount) }, () => "normal" as const),
  ];
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "");
}

function createSpiritId(name: string) {
  return (
    normalizeName(name)
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "") || `spirit-${Date.now()}`
  );
}

function ensureUniqueSpirits(spirits: Spirit[]) {
  const seen = new Map<string, Spirit>();

  for (const spirit of spirits) {
    const key = normalizeName(spirit.name);
    if (!key) continue;

    if (!seen.has(key)) {
      seen.set(key, {
        id: spirit.id || createSpiritId(spirit.name),
        name: spirit.name.trim(),
        image: spirit.image,
        tags: spirit.tags ?? [],
        createdAt: spirit.createdAt,
      });
      continue;
    }

    const current = seen.get(key)!;
    seen.set(key, {
      ...current,
      image: current.image || spirit.image,
      tags: [...new Set([...(current.tags ?? []), ...(spirit.tags ?? [])])],
    });
  }

  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
}

function sanitizeArchiveRecord(record: unknown): ShinyArchiveRecord | undefined {
  if (!record || typeof record !== "object") return undefined;
  const raw = record as Record<string, unknown>;

  if (!raw.spiritId || !raw.taskId) return undefined;

  return {
    id: String(raw.id ?? `archive-${Date.now()}`),
    taskId: String(raw.taskId),
    taskName: String(raw.taskName ?? "未命名任务"),
    planId: String(raw.planId ?? "unknown-plan"),
    planName: String(raw.planName ?? "未命名方案"),
    spiritId: String(raw.spiritId),
    spiritName: String(raw.spiritName ?? raw.spiritId),
    spiritImage: typeof raw.spiritImage === "string" ? raw.spiritImage : undefined,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    sourceType: raw.sourceType === "unexpected" ? "unexpected" : "target",
    isTargetSpirit: Boolean(raw.isTargetSpirit ?? raw.sourceType !== "unexpected"),
    clickable: Boolean(raw.clickable ?? raw.sourceType !== "unexpected"),
    snapshot: {
      pollutionCount: Math.max(
        0,
        Number((raw.snapshot as { pollutionCount?: number } | undefined)?.pollutionCount ?? 0),
      ),
      normalCount: Math.max(
        0,
        Number((raw.snapshot as { normalCount?: number } | undefined)?.normalCount ?? 0),
      ),
    },
  };
}

function migrateLegacyTask(
  rawTask: Record<string, unknown>,
): { task: Task; archives: ShinyArchiveRecord[] } {
  const now = new Date().toISOString();
  const pollutionRecords = Array.isArray(rawTask.pollutionRecords)
    ? (rawTask.pollutionRecords as Array<{ petName?: string; count?: number }>)
    : [];
  const normalRecords = Array.isArray(rawTask.normalRecords)
    ? (rawTask.normalRecords as Array<{ petName?: string; count?: number }>)
    : [];
  const possibleShinies = Array.isArray(rawTask.possibleShinies)
    ? (rawTask.possibleShinies as string[])
    : [];
  const shinyPetName =
    typeof rawTask.shinyPetName === "string" ? rawTask.shinyPetName : undefined;

  const names = new Set<string>();
  possibleShinies.forEach((name) => names.add(name));
  pollutionRecords.forEach((item) => item.petName && names.add(item.petName));
  normalRecords.forEach((item) => item.petName && names.add(item.petName));
  if (shinyPetName) names.add(shinyPetName);

  const targetSpiritIds = Array.from(names).map((name) => {
    const matched = getSpiritByName(name);
    return matched?.id ?? createSpiritId(name);
  });

  const spiritRecords: TaskSpiritRecord[] = targetSpiritIds.map((spiritId) => ({
    spiritId,
    pollutionCount: 0,
    normalCount: 0,
    currentShinyCount: 0,
    progressMarks: [],
  }));

  for (const record of pollutionRecords) {
    if (!record.petName) continue;
    const spiritId =
      getSpiritByName(record.petName)?.id ?? createSpiritId(record.petName);
    const matched = spiritRecords.find((item) => item.spiritId === spiritId);
    if (matched) matched.pollutionCount = Math.max(0, Number(record.count ?? 0));
  }

  for (const record of normalRecords) {
    if (!record.petName) continue;
    const spiritId =
      getSpiritByName(record.petName)?.id ?? createSpiritId(record.petName);
    const matched = spiritRecords.find((item) => item.spiritId === spiritId);
    if (matched) matched.normalCount = Math.max(0, Number(record.count ?? 0));
  }

  for (const record of spiritRecords) {
    record.progressMarks = buildLegacyProgressMarks(
      record.pollutionCount,
      record.normalCount,
    );
  }

  const archives: ShinyArchiveRecord[] = [];
  if (shinyPetName) {
    const spiritId =
      getSpiritByName(shinyPetName)?.id ?? createSpiritId(shinyPetName);
    archives.push({
      id: `legacy-${String(rawTask.id ?? Date.now())}-${spiritId}`,
      taskId: String(rawTask.id ?? `legacy-${Date.now()}`),
      taskName: String(rawTask.taskName ?? rawTask.planName ?? "未命名任务"),
      planId: String(rawTask.planId ?? rawTask.planName ?? "legacy-plan"),
      planName: String(rawTask.planName ?? rawTask.taskName ?? "未命名方案"),
      spiritId,
      spiritName: shinyPetName,
      spiritImage: undefined,
      createdAt:
        typeof rawTask.updatedAt === "string" ? rawTask.updatedAt : now,
      sourceType: "target",
      isTargetSpirit: true,
      clickable: true,
      snapshot: {
        pollutionCount: 0,
        normalCount: 0,
      },
    });
  }

  return {
    task: {
      id: String(rawTask.id ?? `legacy-${Date.now()}`),
      taskName: String(rawTask.taskName ?? rawTask.planName ?? "未命名任务"),
      planId: String(rawTask.planId ?? rawTask.planName ?? "legacy-plan"),
      planName: String(rawTask.planName ?? rawTask.taskName ?? "未命名方案"),
      mode:
        rawTask.mode === "定向果实法" || rawTask.mode === "3×3混抓法"
          ? rawTask.mode
          : "3×3混抓法",
      fruitRecipe: String(rawTask.fruitRecipe ?? ""),
      targetSpiritIds,
      spiritRecords,
      ballUsage: Math.max(0, Number(rawTask.ballUsage ?? rawTask.ballCost ?? 0)),
      hasStarted:
        pollutionRecords.some((item) => Number(item.count ?? 0) > 0) ||
        normalRecords.some((item) => Number(item.count ?? 0) > 0) ||
        Boolean(shinyPetName),
      createdAt:
        typeof rawTask.createdAt === "string" ? rawTask.createdAt : now,
      updatedAt:
        typeof rawTask.updatedAt === "string" ? rawTask.updatedAt : now,
    },
    archives,
  };
}

function sanitizeTask(
  task: unknown,
): { task: Task; archives: ShinyArchiveRecord[] } {
  if (!task || typeof task !== "object") {
    return {
      task: createTaskFromPlan({
        id: "fallback",
        planName: "未命名方案",
        planMode: "3×3混抓法",
        fruitRecipe: "",
        description: "",
        targetSpiritIds: [],
      }),
      archives: [],
    };
  }

  const rawTask = task as Record<string, unknown>;
  if (!Array.isArray(rawTask.spiritRecords)) {
    return migrateLegacyTask(rawTask);
  }

  const now = new Date().toISOString();
  const taskId = String(rawTask.id ?? `task-${Date.now()}`);
  const taskName = String(rawTask.taskName ?? rawTask.planName ?? "未命名任务");
  const planId = String(rawTask.planId ?? rawTask.planName ?? "unknown-plan");
  const planName = String(rawTask.planName ?? rawTask.taskName ?? "未命名方案");
  const updatedAt =
    typeof rawTask.updatedAt === "string" ? rawTask.updatedAt : now;

  const spiritRecords: TaskSpiritRecord[] = (rawTask.spiritRecords as Array<Record<string, unknown>>).map(
    (record) => ({
      spiritId: String(record.spiritId ?? ""),
      pollutionCount: Math.max(0, Number(record.pollutionCount ?? 0)),
      normalCount: Math.max(0, Number(record.normalCount ?? 0)),
      currentShinyCount: Math.max(
        0,
        Number(record.currentShinyCount ?? record.shinyCount ?? 0),
      ),
      progressMarks: Array.isArray(record.progressMarks)
        ? record.progressMarks
            .map((item) => (item === "normal" ? "normal" : item === "pollution" ? "pollution" : undefined))
            .filter((item): item is ProgressMarkType => Boolean(item))
        : buildLegacyProgressMarks(
            Math.max(0, Number(record.pollutionCount ?? 0)),
            Math.max(0, Number(record.normalCount ?? 0)),
          ),
      lastAction:
        record.lastAction && typeof record.lastAction === "object"
          ? {
              id: String((record.lastAction as Record<string, unknown>).id ?? ""),
              type:
                (record.lastAction as Record<string, unknown>).type === "normal"
                  ? "normal"
                  : (record.lastAction as Record<string, unknown>).type === "shiny"
                    ? "shiny"
                    : "pollution",
              createdAt: String(
                (record.lastAction as Record<string, unknown>).createdAt ?? updatedAt,
              ),
              previousPollutionCount: Math.max(
                0,
                Number(
                  (record.lastAction as Record<string, unknown>).previousPollutionCount ?? 0,
                ),
              ),
              previousNormalCount: Math.max(
                0,
                Number(
                  (record.lastAction as Record<string, unknown>).previousNormalCount ?? 0,
                ),
              ),
              previousCurrentShinyCount: Math.max(
                0,
                Number(
                  (record.lastAction as Record<string, unknown>).previousCurrentShinyCount ?? 0,
                ),
              ),
              archiveRecordId:
                typeof (record.lastAction as Record<string, unknown>).archiveRecordId ===
                "string"
                  ? String(
                      (record.lastAction as Record<string, unknown>).archiveRecordId,
                    )
                  : undefined,
              previousProgressMarks: Array.isArray(
                (record.lastAction as Record<string, unknown>).previousProgressMarks,
              )
                ? (
                    (record.lastAction as Record<string, unknown>)
                      .previousProgressMarks as unknown[]
                  )
                    .map((item) =>
                      item === "normal"
                        ? "normal"
                        : item === "pollution"
                          ? "pollution"
                          : undefined,
                    )
                    .filter((item): item is ProgressMarkType => Boolean(item))
                : buildLegacyProgressMarks(
                    Math.max(
                      0,
                      Number(
                        (record.lastAction as Record<string, unknown>)
                          .previousPollutionCount ?? 0,
                      ),
                    ),
                    Math.max(
                      0,
                      Number(
                        (record.lastAction as Record<string, unknown>)
                          .previousNormalCount ?? 0,
                      ),
                    ),
                  ),
            }
          : undefined,
    }),
  );

  const migratedArchives: ShinyArchiveRecord[] = [];
  for (const record of spiritRecords) {
    if (record.currentShinyCount > 0) {
      migratedArchives.push({
        id: `migrated-${taskId}-${record.spiritId}`,
        taskId,
        taskName,
        planId,
        planName,
        spiritId: record.spiritId,
        spiritName: record.spiritId,
        createdAt: updatedAt,
        sourceType: "target",
        isTargetSpirit: true,
        clickable: true,
        snapshot: {
          pollutionCount: record.pollutionCount,
          normalCount: record.normalCount,
        },
      });
      record.currentShinyCount = 0;
      record.pollutionCount = 0;
      record.normalCount = 0;
    }
  }

  return {
    task: {
      id: taskId,
      taskName,
      planId,
      planName,
      mode:
        rawTask.mode === "定向果实法" || rawTask.mode === "3×3混抓法"
          ? rawTask.mode
          : "3×3混抓法",
      fruitRecipe: String(rawTask.fruitRecipe ?? ""),
      targetSpiritIds: Array.isArray(rawTask.targetSpiritIds)
        ? rawTask.targetSpiritIds.map((item) => String(item))
        : [],
      spiritRecords,
      ballUsage: Math.max(0, Number(rawTask.ballUsage ?? 0)),
      hasStarted:
        Boolean(rawTask.hasStarted) ||
        spiritRecords.some(
          (record) =>
            record.pollutionCount > 0 ||
            record.normalCount > 0 ||
            record.currentShinyCount > 0,
        ),
      createdAt:
        typeof rawTask.createdAt === "string" ? rawTask.createdAt : now,
      updatedAt,
    },
    archives: migratedArchives,
  };
}

function collectSpiritsFromTasks(tasks: Task[], archives: ShinyArchiveRecord[]) {
  const extraSpirits: Spirit[] = [];

  for (const task of tasks) {
    for (const record of task.spiritRecords) {
      const known = (baseSpirits as Spirit[]).find((item) => item.id === record.spiritId);
      if (known) continue;
      extraSpirits.push({
        id: record.spiritId,
        name: record.spiritId,
      });
    }
  }

  for (const archive of archives) {
    const known = (baseSpirits as Spirit[]).find((item) => item.id === archive.spiritId);
    if (known) continue;
    extraSpirits.push({
      id: archive.spiritId,
      name: archive.spiritName,
      image: archive.spiritImage,
    });
  }

  return extraSpirits;
}

export function loadAppData(): AppStorage {
  if (typeof window === "undefined") return fallbackData;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallbackData;

  try {
    const parsed = JSON.parse(raw) as Partial<AppStorage>;
    const sanitizedTasks = Array.isArray(parsed.tasks)
      ? parsed.tasks.map((task) => sanitizeTask(task))
      : [];
    const tasks = sanitizedTasks.map((item) => item.task);
    const migratedArchives = sanitizedTasks.flatMap((item) => item.archives);
    const parsedArchives = Array.isArray(parsed.shinyArchiveRecords)
      ? parsed.shinyArchiveRecords
          .map((record) => sanitizeArchiveRecord(record))
          .filter((item): item is ShinyArchiveRecord => Boolean(item))
      : [];

    const shinyArchiveRecords = [...parsedArchives, ...migratedArchives]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter(
        (record, index, list) =>
          list.findIndex((item) => item.id === record.id) === index,
      );

    const spirits = ensureUniqueSpirits([
      ...(baseSpirits as Spirit[]),
      ...(Array.isArray(parsed.spirits) ? parsed.spirits : []),
      ...collectSpiritsFromTasks(tasks, shinyArchiveRecords),
    ]);

    return {
      tasks,
      spirits,
      shinyArchiveRecords,
      currentTaskId: parsed.currentTaskId,
      theme: parsed.theme ?? "light",
    };
  } catch {
    return fallbackData;
  }
}

export function saveAppData(data: AppStorage) {
  if (typeof window === "undefined") return;

  const safeData: AppStorage = {
    tasks: data.tasks,
    spirits: ensureUniqueSpirits(data.spirits),
    shinyArchiveRecords: [...data.shinyArchiveRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
    currentTaskId: data.currentTaskId,
    theme: data.theme ?? "light",
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
}

export function getTasks() {
  return loadAppData().tasks.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getTaskById(taskId?: string) {
  if (!taskId) return undefined;
  return getTasks().find((task) => task.id === taskId);
}

export function saveTask(task: Task, makeCurrent = true) {
  const data = loadAppData();
  const nextTasks = [...data.tasks];
  const index = nextTasks.findIndex((item) => item.id === task.id);

  if (index >= 0) {
    nextTasks[index] = task;
  } else {
    nextTasks.push(task);
  }

  saveAppData({
    ...data,
    tasks: nextTasks,
    currentTaskId: makeCurrent ? task.id : data.currentTaskId,
  });
}

export function deleteTask(taskId: string) {
  const data = loadAppData();
  saveAppData({
    ...data,
    tasks: data.tasks.filter((task) => task.id !== taskId),
    currentTaskId: data.currentTaskId === taskId ? undefined : data.currentTaskId,
  });
}

export function getCurrentTask() {
  const data = loadAppData();
  const matched = data.tasks.find((task) => task.id === data.currentTaskId);
  if (matched) return matched;
  return getTasks()[0];
}

export function setCurrentTask(taskId?: string) {
  const data = loadAppData();
  saveAppData({
    ...data,
    currentTaskId: taskId,
  });
}

export function getSpirits() {
  return loadAppData().spirits;
}

export function upsertSpirit(input: {
  id?: string;
  name: string;
  image?: string;
  tags?: string[];
}) {
  const data = loadAppData();
  const normalized = normalizeName(input.name);
  const existing = data.spirits.find(
    (item) => normalizeName(item.name) === normalized || item.id === input.id,
  );

  const spirit: Spirit = existing
    ? {
        ...existing,
        name: input.name.trim(),
        image: existing.image || input.image,
        tags: [...new Set([...(existing.tags ?? []), ...(input.tags ?? [])])],
      }
    : {
        id: input.id ?? createSpiritId(input.name),
        name: input.name.trim(),
        image: input.image,
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
      };

  const nextSpirits = ensureUniqueSpirits(
    existing
      ? data.spirits.map((item) => (item.id === existing.id ? spirit : item))
      : [...data.spirits, spirit],
  );

  saveAppData({
    ...data,
    spirits: nextSpirits,
  });

  return nextSpirits.find((item) => item.id === spirit.id) ?? spirit;
}

export function getShinyArchiveRecords() {
  return loadAppData().shinyArchiveRecords;
}

export function saveShinyArchiveRecord(record: ShinyArchiveRecord) {
  const data = loadAppData();
  saveAppData({
    ...data,
    shinyArchiveRecords: [record, ...data.shinyArchiveRecords],
  });
}

export function deleteShinyArchiveRecord(recordId: string) {
  const data = loadAppData();
  saveAppData({
    ...data,
    shinyArchiveRecords: data.shinyArchiveRecords.filter((record) => record.id !== recordId),
  });
}

export function clearAllData() {
  saveAppData(fallbackData);
}

export function exportData() {
  return JSON.stringify(loadAppData(), null, 2);
}

export function importData(raw: string) {
  const parsed = JSON.parse(raw) as AppStorage;
  const safeData = loadAppData();
  const incoming = Array.isArray(parsed.tasks) ? parsed.tasks.map((task) => sanitizeTask(task)) : [];
  const archiveRecords = Array.isArray(parsed.shinyArchiveRecords)
    ? parsed.shinyArchiveRecords
        .map((record) => sanitizeArchiveRecord(record))
        .filter((item): item is ShinyArchiveRecord => Boolean(item))
    : [];

  saveAppData({
    tasks: incoming.map((item) => item.task),
    spirits: ensureUniqueSpirits([
      ...(baseSpirits as Spirit[]),
      ...(Array.isArray(parsed.spirits) ? parsed.spirits : []),
    ]),
    shinyArchiveRecords: [...archiveRecords, ...incoming.flatMap((item) => item.archives)],
    currentTaskId: parsed.currentTaskId,
    theme: parsed.theme ?? safeData.theme ?? "light",
  });

  return loadAppData();
}
