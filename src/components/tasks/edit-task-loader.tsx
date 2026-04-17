"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export default function EditTaskLoader() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    const { getTasks } = require("@/lib/storage");
    const matched = getTasks().find((item: Task) => item.id === params.id);
    if (matched) setTask(matched);
  }, [params.id]);

  if (!task) {
    return <Card className="p-8 text-center">未找到需要编辑的任务。</Card>;
  }

  if (task.completed) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-lg font-black">已存档任务不可编辑</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          这条异色记录已经完成存档，系统会锁定数据，避免误改统计结果。
        </p>
      </Card>
    );
  }

  return <TaskForm initialTask={task} />;
}
