export type TaskMode = "定向果实法" | "3×3混抓法";

export interface Spirit {
  id: string;
  name: string;
  image?: string;
  tags?: string[];
  createdAt?: string;
}

export interface PlanPreset {
  id: string;
  planName: string;
  planMode: TaskMode;
  fruitRecipe: string;
  description: string;
  targetSpiritIds: string[];
  image?: string;
  isDirected?: boolean;
}

export type ProgressMarkType = "pollution" | "normal";

export interface SpiritCardLastAction {
  id: string;
  type: "pollution" | "normal" | "shiny";
  createdAt: string;
  previousPollutionCount: number;
  previousNormalCount: number;
  previousCurrentShinyCount: number;
  previousProgressMarks?: ProgressMarkType[];
  archiveRecordId?: string;
}

export interface TaskSpiritRecord {
  spiritId: string;
  pollutionCount: number;
  normalCount: number;
  currentShinyCount: number;
  progressMarks?: ProgressMarkType[];
  lastAction?: SpiritCardLastAction;
}

export interface Task {
  id: string;
  taskName: string;
  planId: string;
  planName: string;
  mode: TaskMode;
  fruitRecipe: string;
  targetSpiritIds: string[];
  spiritRecords: TaskSpiritRecord[];
  ballUsage: number;
  hasStarted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShinyArchiveSourceType = "target" | "unexpected";

export interface ShinyArchiveRecord {
  id: string;
  taskId: string;
  taskName: string;
  planId: string;
  planName: string;
  spiritId: string;
  spiritName: string;
  spiritImage?: string;
  createdAt: string;
  sourceType: ShinyArchiveSourceType;
  isTargetSpirit: boolean;
  clickable: boolean;
  snapshot: {
    pollutionCount: number;
    normalCount: number;
  };
}

export interface SpiritTaskSummary {
  taskId: string;
  taskName: string;
  planId: string;
  planName: string;
  mode: TaskMode;
  pollutionCount: number;
  normalCount: number;
  shinyCount: number;
  updatedAt: string;
}

export interface SpiritSummary {
  spirit: Spirit;
  pollutionCount: number;
  normalCount: number;
  shinyCount: number;
  latestShinyAt?: string;
  tasks: SpiritTaskSummary[];
}

export interface AppStorage {
  tasks: Task[];
  spirits: Spirit[];
  shinyArchiveRecords: ShinyArchiveRecord[];
  currentTaskId?: string;
  theme?: "light" | "dark";
}

export type PetPreset = Spirit;
