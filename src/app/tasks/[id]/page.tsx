import { TaskDetailClient } from "@/components/tasks/task-detail-client";
import { PageShell } from "@/components/ui/page-shell";

export function generateStaticParams() {
  return [{ id: "_placeholder" }];
}

export default function TaskDetailPage() {
  return (
    <PageShell title="任务详情">
      <TaskDetailClient />
    </PageShell>
  );
}
