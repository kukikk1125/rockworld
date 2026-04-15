import EditTaskLoader from "@/components/tasks/edit-task-loader";
import { PageShell } from "@/components/ui/page-shell";

export function generateStaticParams() {
  return [{ id: "_placeholder" }];
}

export default function EditTaskPage() {
  return (
    <PageShell title="编辑任务">
      <EditTaskLoader />
    </PageShell>
  );
}
