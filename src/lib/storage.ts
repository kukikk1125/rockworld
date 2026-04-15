"use client";

import { hydrateTask } from "@/lib/calculations";
import { AppStorage, Task } from "@/types";

const STORAGE_KEY = "rockworld-shiny-tracker";

const fallbackData: AppStorage = {
  tasks: [],
  currentTaskId: undefined,
  theme: "light",
};

export function loadAppData(): AppStorage {
  if (typeof window === "undefined") return fallbackData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return fallbackData;

  try {
    const parsed = JSON.parse(raw) as AppStorage;
    return {
      ...fallbackData,
      ...parsed,
      tasks: (parsed.tasks ?? []).map(hydrateTask),
    };
  } catch {
    return fallbackData;
  }
}

export function saveAppData(data: AppStorage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTasks() {
  return loadAppData().tasks.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function saveTask(task: Task, makeCurrent = true) {
  const data = loadAppData();
  const nextTasks = [...data.tasks];
  const index = nextTasks.findIndex((item) => item.id === task.id);

  if (index >= 0) nextTasks[index] = hydrateTask(task);
  else nextTasks.push(hydrateTask(task));

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
    currentTaskId:
      data.currentTaskId === taskId ? undefined : data.currentTaskId,
  });
}

export function getCurrentTask() {
  const data = loadAppData();
  const matched = data.tasks.find((task) => task.id === data.currentTaskId);
  if (matched && !matched.completed) return hydrateTask(matched);
  return getTasks().find((task) => !task.completed);
}

export function setCurrentTask(taskId?: string) {
  const data = loadAppData();
  saveAppData({
    ...data,
    currentTaskId: taskId,
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
  const safeData: AppStorage = {
    tasks: (parsed.tasks ?? []).map(hydrateTask),
    currentTaskId: parsed.currentTaskId,
    theme: parsed.theme ?? "light",
  };
  saveAppData(safeData);
  return safeData;
}
