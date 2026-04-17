import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCycleProgress } from "@/lib/calculations";
import { Task } from "@/types";

export function CycleStatusCard({ task }: { task: Task }) {
  if (task.mode !== "3×3混抓法") return null;

  const { aInRound, bInRound } = getCycleProgress(task.aCaught ?? 0, task.bCaught ?? 0);

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted-foreground">3×3 模式状态</p>
          <h3 className="text-lg font-black">当前轮数与抓取提示</h3>
        </div>
        <Badge className="bg-sky-100 text-sky-700">当前应抓 {task.currentCycleTarget ?? "A"}</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        <StatBlock label="当前轮数" value={`${task.cycleRounds ?? 0}`} />
        <StatBlock label="A 当前数量 / 3" value={`${aInRound}/3`} />
        <StatBlock label="B 当前数量 / 3" value={`${bInRound}/3`} />
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>A 系进度</span>
            <span>{aInRound}/3</span>
          </div>
          <Progress value={(aInRound / 3) * 100} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>B 系进度</span>
            <span>{bInRound}/3</span>
          </div>
          <Progress value={(bInRound / 3) * 100} className="[&>div]:bg-emerald-500" />
        </div>
      </div>

      <p className="mt-4 text-[13px] leading-6 text-muted-foreground">
        A 满 3 后切到 B，B 满 3 后自动进入下一轮。页面按钮会按当前状态推进。
      </p>
    </Card>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/40 p-3.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-black">{value}</div>
    </div>
  );
}
