import { Suspense } from "react";
import { PlanRecordClient } from "@/components/plans/plan-record-client";
import { PageShell } from "@/components/ui/page-shell";

export default function TaskViewPage() {
  return (
    <PageShell title="任务记录">
      <Suspense fallback={null}>
        <PlanRecordClient />
      </Suspense>
    </PageShell>
  );
}
