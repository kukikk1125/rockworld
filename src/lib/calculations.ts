import { createId } from "@/lib/utils";
import {
  deleteShinyArchiveRecord,
  getShinyArchiveRecords,
  getSpirits,
  getTasks,
} from "@/lib/storage";
import {
  ShinyArchiveRecord,
  Spirit,
  SpiritSummary,
  Task,
  TaskSpiritRecord,
} from "@/types";

function cloneRecords(records: TaskSpiritRecord[]): TaskSpiritRecord[] {
  return records.map(
    (record): TaskSpiritRecord => ({
      ...record,
      lastAction: record.lastAction ? { ...record.lastAction } : undefined,
    }),
  );
}

function upsertRecord(task: Task, spiritId: string) {
  const records = cloneRecords(task.spiritRecords);
  let record: TaskSpiritRecord | undefined = records.find(
    (item) => item.spiritId === spiritId,
  );

  if (!record) {
    record = {
      spiritId,
      pollutionCount: 0,
      normalCount: 0,
      currentShinyCount: 0,
    };
    records.push(record);
  }

  return { records, record: record as TaskSpiritRecord };
}

function withTask(task: Task, spiritRecords: TaskSpiritRecord[]) {
  return {
    ...task,
    spiritRecords,
    hasStarted: true,
    updatedAt: new Date().toISOString(),
  };
}

export function getTaskSpiritProgress(record: TaskSpiritRecord) {
  return record.pollutionCount + record.normalCount;
}

export function getTotalPollutionCount(task: Task) {
  return task.spiritRecords.reduce((sum, record) => sum + record.pollutionCount, 0);
}

export function getTotalNormalCount(task: Task) {
  return task.spiritRecords.reduce((sum, record) => sum + record.normalCount, 0);
}

export function hasTaskData(task: Task) {
  return (
    task.hasStarted ||
    task.spiritRecords.some(
      (record) =>
        record.pollutionCount > 0 ||
        record.normalCount > 0 ||
        record.currentShinyCount > 0,
    )
  );
}

export function addPollutionCount(task: Task, spiritId: string, delta = 1) {
  const { records, record } = upsertRecord(task, spiritId);
  record.lastAction = {
    id: createId(),
    type: "pollution",
    createdAt: new Date().toISOString(),
    previousPollutionCount: record.pollutionCount,
    previousNormalCount: record.normalCount,
    previousCurrentShinyCount: record.currentShinyCount,
  };
  record.pollutionCount = Math.max(0, record.pollutionCount + delta);
  return withTask(task, records);
}

export function addNormalCount(task: Task, spiritId: string, delta = 1) {
  const { records, record } = upsertRecord(task, spiritId);
  record.lastAction = {
    id: createId(),
    type: "normal",
    createdAt: new Date().toISOString(),
    previousPollutionCount: record.pollutionCount,
    previousNormalCount: record.normalCount,
    previousCurrentShinyCount: record.currentShinyCount,
  };
  record.normalCount = Math.max(0, record.normalCount + delta);
  return withTask(task, records);
}

export function createTargetShinyArchiveRecord(
  task: Task,
  spirit: Spirit,
  record: TaskSpiritRecord,
): ShinyArchiveRecord {
  return {
    id: createId(),
    taskId: task.id,
    taskName: task.taskName,
    planId: task.planId,
    planName: task.planName,
    spiritId: spirit.id,
    spiritName: spirit.name,
    spiritImage: spirit.image,
    createdAt: new Date().toISOString(),
    sourceType: "target",
    isTargetSpirit: true,
    clickable: true,
    snapshot: {
      pollutionCount: record.pollutionCount,
      normalCount: record.normalCount,
    },
  };
}

export function createUnexpectedShinyArchiveRecord(
  task: Task,
  spirit: Spirit,
): ShinyArchiveRecord {
  return {
    id: createId(),
    taskId: task.id,
    taskName: task.taskName,
    planId: task.planId,
    planName: task.planName,
    spiritId: spirit.id,
    spiritName: spirit.name,
    spiritImage: spirit.image,
    createdAt: new Date().toISOString(),
    sourceType: "unexpected",
    isTargetSpirit: false,
    clickable: false,
    snapshot: {
      pollutionCount: 0,
      normalCount: 0,
    },
  };
}

export function archiveTargetShiny(
  task: Task,
  spirit: Spirit,
): { task: Task; archiveRecord: ShinyArchiveRecord } {
  const { records, record } = upsertRecord(task, spirit.id);
  const archiveRecord = createTargetShinyArchiveRecord(task, spirit, record);

  record.lastAction = {
    id: createId(),
    type: "shiny",
    createdAt: archiveRecord.createdAt,
    previousPollutionCount: record.pollutionCount,
    previousNormalCount: record.normalCount,
    previousCurrentShinyCount: record.currentShinyCount,
    archiveRecordId: archiveRecord.id,
  };
  record.currentShinyCount = 0;
  record.pollutionCount = 0;
  record.normalCount = 0;

  return {
    task: withTask(task, records),
    archiveRecord,
  };
}

export function archiveUnexpectedShiny(task: Task): Task {
  return {
    ...task,
    hasStarted: true,
    updatedAt: new Date().toISOString(),
  };
}

export function undoSpiritLastAction(
  task: Task,
  spiritId: string,
): { task: Task; removedArchiveId?: string } {
  const records = cloneRecords(task.spiritRecords);
  const record = records.find((item) => item.spiritId === spiritId);
  if (!record?.lastAction) return { task };

  const { previousPollutionCount, previousNormalCount, previousCurrentShinyCount } =
    record.lastAction;
  const removedArchiveId = record.lastAction.archiveRecordId;

  record.pollutionCount = previousPollutionCount;
  record.normalCount = previousNormalCount;
  record.currentShinyCount = previousCurrentShinyCount;
  record.lastAction = undefined;

  return {
    task: {
      ...task,
      spiritRecords: records,
      updatedAt: new Date().toISOString(),
    },
    removedArchiveId,
  };
}

export function getSpiritGlobalShinyCount(spiritId: string) {
  return getShinyArchiveRecords().filter((record) => record.spiritId === spiritId).length;
}

export function getTaskArchiveCount(taskId: string) {
  return getShinyArchiveRecords().filter((record) => record.taskId === taskId).length;
}

export function getTaskSpiritRecords(task: Task) {
  return [...task.spiritRecords].sort(
    (a, b) => getTaskSpiritProgress(b) - getTaskSpiritProgress(a),
  );
}

export function getSpiritSummary(spiritId: string): SpiritSummary | undefined {
  const spirit = getSpirits().find((item) => item.id === spiritId);
  if (!spirit) return undefined;

  const archives = getShinyArchiveRecords().filter((record) => record.spiritId === spiritId);
  const tasks = getTasks()
    .map((task) => {
      const record = task.spiritRecords.find((item) => item.spiritId === spiritId);
      const taskArchives = archives.filter((archive) => archive.taskId === task.id);
      if (!record && taskArchives.length === 0) return undefined;

      const pollutionCount =
        (record?.pollutionCount ?? 0) +
        taskArchives.reduce((sum, archive) => sum + archive.snapshot.pollutionCount, 0);
      const normalCount =
        (record?.normalCount ?? 0) +
        taskArchives.reduce((sum, archive) => sum + archive.snapshot.normalCount, 0);

      return {
        taskId: task.id,
        taskName: task.taskName,
        planId: task.planId,
        planName: task.planName,
        mode: task.mode,
        pollutionCount,
        normalCount,
        shinyCount: taskArchives.length,
        updatedAt: task.updatedAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const latestShinyAt = archives
    .map((record) => record.createdAt)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    spirit,
    pollutionCount: tasks.reduce((sum, item) => sum + item.pollutionCount, 0),
    normalCount: tasks.reduce((sum, item) => sum + item.normalCount, 0),
    shinyCount: archives.length,
    latestShinyAt,
    tasks,
  };
}

export function getOwnedSpiritIds() {
  return new Set(getShinyArchiveRecords().map((record) => record.spiritId));
}

export function getRecentShinyRecords() {
  return [...getShinyArchiveRecords()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getArchiveRecordById(recordId?: string) {
  if (!recordId) return undefined;
  return getShinyArchiveRecords().find((record) => record.id === recordId);
}

export function removeArchiveRecord(recordId?: string) {
  if (!recordId) return;
  deleteShinyArchiveRecord(recordId);
}
