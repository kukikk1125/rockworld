import { PlanRecordClient } from "@/components/plans/plan-record-client";
import { PageShell } from "@/components/ui/page-shell";

export function generateStaticParams() {
  return [{ id: "_placeholder" }];
}

export default function TaskDetailPage() {
  return (
    <PageShell title="任务记录">
      <PlanRecordClient />
    </PageShell>
  );
}
