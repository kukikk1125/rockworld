import { TaskForm } from "@/components/tasks/task-form";
import { PageShell } from "@/components/ui/page-shell";

export default function NewTaskPage() {
  return (
    <PageShell title="新建任务">
      <TaskForm />
    </PageShell>
  );
}
