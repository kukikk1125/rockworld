"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { Card } from "@/components/ui/card";

export default function EditTaskLoader() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<any>(null);

  useEffect(() => {
    const { getTasks } = require("@/lib/storage");
    const matched = getTasks().find((item: any) => item.id === params.id);
    if (matched) setTask(matched);
  }, [params.id]);

  if (!task) {
    return <Card className="p-8 text-center">未找到需要编辑的任务。</Card>;
  }

  return <TaskForm initialTask={task} />;
}
