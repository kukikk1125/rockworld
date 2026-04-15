import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date?: string) {
  if (!date) return "暂无";
  return new Date(date).toLocaleString("zh-CN", {
    hour12: false,
  });
}

export function createId() {
  return Math.random().toString(36).slice(2, 10);
}
