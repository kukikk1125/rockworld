import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";

export default function CatchallTaskPage() {
  return (
    <PageShell title="任务">
      <Card className="p-6 text-center">
        <h2 className="text-lg font-black">请选择一个有效任务</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">当前链接没有匹配到可展示的任务记录，请返回首页或历史页重新进入。</p>
      </Card>
    </PageShell>
  );
}
