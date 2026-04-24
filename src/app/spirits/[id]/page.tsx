import { SpiritDetailClient } from "@/components/tasks/spirit-detail-client";
import { PageShell } from "@/components/ui/page-shell";

export function generateStaticParams() {
  return [{ id: "_placeholder" }];
}

export default function SpiritDetailPage() {
  return (
    <PageShell title="精灵详情">
      <SpiritDetailClient />
    </PageShell>
  );
}
