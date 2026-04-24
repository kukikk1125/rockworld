"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageShell } from "@/components/ui/page-shell";
import {
  getRecentShinyRecords,
  getTaskArchiveCount,
  getTotalNormalCount,
  getTotalPollutionCount,
  isTaskInProgress,
} from "@/lib/calculations";
import { deleteShinyArchiveRecord, deleteTask, getTasks, setCurrentTask } from "@/lib/storage";
import { formatDateTime } from "@/lib/utils";
import { ShinyArchiveRecord, Task } from "@/types";

function TaskListCard({
  task,
  onOpen,
  onDelete,
}: {
  task: Task;
  onOpen: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className="w-full text-left transition-transform hover:scale-[1.01]"
    >
      <Card className="overflow-hidden bg-white/90 p-0">
        <div className="grid gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-amber-100 text-amber-700">{task.mode}</Badge>
                <Badge className="bg-white/80 text-slate-700">任务记录</Badge>
              </div>
              <div>
                <h3 className="text-lg font-black">{task.taskName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{task.fruitRecipe}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task);
              }}
              className="text-xs text-red-500 hover:text-red-700"
            >
              删除
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">污染</div>
              <div className="text-sm font-black text-rose-600">{getTotalPollutionCount(task)}</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">原色</div>
              <div className="text-sm font-black text-sky-600">{getTotalNormalCount(task)}</div>
            </div>
            <div className="rounded-2xl bg-white/80 p-2 text-center">
              <div className="text-[10px] text-muted-foreground">异色成果</div>
              <div className="text-sm font-black text-emerald-600">{getTaskArchiveCount(task.id)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ArchiveRecordCard({
  record,
  onOpen,
  onDelete,
}: {
  record: ShinyArchiveRecord;
  onOpen: (record: ShinyArchiveRecord) => void;
  onDelete: (record: ShinyArchiveRecord) => void;
}) {
  const clickable = record.clickable;

  return (
    <Card
      className={`overflow-hidden p-4 ${
        clickable ? "bg-white/90 transition-transform hover:scale-[1.01]" : "bg-slate-50/90"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onDelete(record)}
          className="shrink-0 text-xs text-red-500 transition hover:text-red-700"
        >
          删除
        </button>
        <div
          role={clickable ? "button" : undefined}
          tabIndex={clickable ? 0 : undefined}
          onClick={clickable ? () => onOpen(record) : undefined}
          onKeyDown={
            clickable
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(record);
                  }
                }
              : undefined
          }
          className={`${clickable ? "cursor-pointer" : ""} flex min-w-0 flex-1 items-center gap-3`}
        >
          <PetImage
            src={record.spiritImage}
            alt={record.spiritName}
            className="h-16 w-16 rounded-full border-2 border-emerald-200"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge className={record.sourceType === "unexpected" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}>
                {record.sourceType === "unexpected" ? "意外异色" : "方案内异色"}
              </Badge>
              <Badge className="bg-white/80 text-slate-700">{record.planName}</Badge>
            </div>
            <h3 className="mt-2 text-base font-black">{record.spiritName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(record.createdAt)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ArchiveDetailDrawer({
  record,
  onClose,
  onDelete,
}: {
  record: ShinyArchiveRecord | null;
  onClose: () => void;
  onDelete: (record: ShinyArchiveRecord) => void;
}) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center bg-slate-950/55 p-4">
      <Card className="w-full max-w-lg rounded-[32px] border-border/80 bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <PetImage
              src={record.spiritImage}
              alt={record.spiritName}
              className="h-16 w-16 rounded-full border-2 border-emerald-200"
            />
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-100 text-emerald-700">历史快照</Badge>
                <Badge className="bg-white/80 text-slate-700">{record.planName}</Badge>
              </div>
              <h3 className="mt-2 text-lg font-black">{record.spiritName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(record.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onDelete(record)}>
              删除记录
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-rose-50 p-4 text-center">
            <div className="text-[10px] text-muted-foreground">当时污染记录</div>
            <div className="mt-1 text-xl font-black text-rose-600">
              {record.snapshot.pollutionCount}
            </div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4 text-center">
            <div className="text-[10px] text-muted-foreground">当时原色记录</div>
            <div className="mt-1 text-xl font-black text-sky-600">
              {record.snapshot.normalCount}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tab, setTab] = useState<"tasks" | "archives">("tasks");
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [archiveDeleteTarget, setArchiveDeleteTarget] = useState<ShinyArchiveRecord | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<ShinyArchiveRecord | null>(null);
  const [archiveRefreshKey, setArchiveRefreshKey] = useState(0);

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  const visibleTasks = useMemo(() => tasks.filter((task) => isTaskInProgress(task)), [tasks]);
  const archives = useMemo(() => getRecentShinyRecords(), [tasks, tab, archiveRefreshKey]);

  function refresh() {
    setTasks(getTasks());
  }

  function openTask(task: Task) {
    setCurrentTask(task.id);
    router.push(`/tasks/view?taskId=${encodeURIComponent(task.id)}`);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteTask(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  }

  function handleArchiveDelete() {
    if (!archiveDeleteTarget) return;
    deleteShinyArchiveRecord(archiveDeleteTarget.id);
    if (selectedArchive?.id === archiveDeleteTarget.id) {
      setSelectedArchive(null);
    }
    setArchiveDeleteTarget(null);
    setArchiveRefreshKey((value) => value + 1);
  }

  return (
    <PageShell title="记录">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={tab === "tasks" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("tasks")}
          >
            任务列表
          </Button>
          <Button
            variant={tab === "archives" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("archives")}
          >
            已存档异色
          </Button>
        </div>

        {tab === "tasks" ? (
          <>
            <div>
              <h2 className="text-sm font-black">任务列表</h2>
            </div>
            {visibleTasks.length > 0 ? (
              <div className="grid gap-3">
                {visibleTasks.map((task) => (
                  <TaskListCard
                    key={task.id}
                    task={task}
                    onOpen={openTask}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">当前还没有可展示的任务记录。</p>
              </Card>
            )}
          </>
        ) : (
          <>
            <div>
              <h2 className="text-sm font-black">已存档异色记录</h2>
            </div>

            {archives.length > 0 ? (
              <div className="grid gap-3">
                {archives.map((record) => (
                  <ArchiveRecordCard
                    key={record.id}
                    record={record}
                    onOpen={setSelectedArchive}
                    onDelete={setArchiveDeleteTarget}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-sm text-muted-foreground">还没有异色存档记录。</p>
              </Card>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="确认删除任务"
        description={`确定要删除“${deleteTarget?.taskName ?? ""}”吗？该操作只删除任务过程，不删除已经存档的异色成果。`}
        confirmText="删除任务"
        cancelText="取消"
        confirmVariant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!archiveDeleteTarget}
        title="确认删除异色记录"
        description={`确定要删除“${archiveDeleteTarget?.spiritName ?? ""}”的这条已存档异色记录吗？该操作只删除当前存档记录。`}
        confirmText="删除记录"
        cancelText="取消"
        confirmVariant="destructive"
        onCancel={() => setArchiveDeleteTarget(null)}
        onConfirm={handleArchiveDelete}
      />

      <ArchiveDetailDrawer
        record={selectedArchive}
        onClose={() => setSelectedArchive(null)}
        onDelete={setArchiveDeleteTarget}
      />
    </PageShell>
  );
}
