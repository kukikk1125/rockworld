export type PetType = "常驻" | "赛季限定" | "战令/活动";
export type TaskMode = "定向单刷法" | "3×3混抓法" | "无需刷取";
export type ShinyStatus = "未获取" | "概率获取" | "保底获取";
export type CycleTarget = "A" | "B";

export interface PetPreset {
  petName: string;
  petType: PetType;
  familyOrType: string;
  recommendedMode: TaskMode;
  aPet: string;
  bPet: string;
  spawnLocation: string;
  fruitInfo: string;
  image: string;
}

export type ActionType = "shield" | "normal";

export interface Task {
  id: string;
  petName: string;
  petType: PetType;
  familyOrType: string;
  mode: TaskMode;
  aPet?: string;
  bPet?: string;
  aCaught?: number;
  bCaught?: number;
  cycleRounds?: number;
  currentCycleTarget?: CycleTarget;
  shieldBreakCount: number;
  pityRemaining: number;
  isInShelter: boolean;
  hasFruit: boolean;
  normalCaughtCount: number;
  estimatedNormalRemaining: number;
  estimatedBallCost: number;
  lastSwitchAt?: string;
  shinyStatus: ShinyStatus;
  spawnLocation?: string;
  fruitInfo?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  probabilityMarked?: boolean;
  actionHistory: ActionType[];
}

export interface AppStorage {
  tasks: Task[];
  currentTaskId?: string;
  theme?: "light" | "dark";
}
