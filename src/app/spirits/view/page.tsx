import { Suspense } from "react";
import { SpiritDetailClient } from "@/components/tasks/spirit-detail-client";
import { PageShell } from "@/components/ui/page-shell";

export default function SpiritViewPage() {
  return (
    <PageShell title="精灵详情">
      <Suspense fallback={null}>
        <SpiritDetailClient />
      </Suspense>
    </PageShell>
  );
}
