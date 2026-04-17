import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export function TaskStatusCard({
  task,
  showAnimation = false,
}: {
  task: Task;
  showAnimation?: boolean;
}) {
  const totalActions = task.actionHistory?.length || 0;
  const shinyIndex = task.completed ? totalActions + 1 : -1;

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-muted-foreground">核心统计</p>
          <h3 className="text-lg font-black">保底进度表</h3>
        </div>
        <Badge className={getStatusBadgeClass(task.shinyStatus)}>{task.shinyStatus}</Badge>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 80 }, (_, i) => i + 1).map((num) => {
            const actionIndex = num - 1;
            const actionType = task.actionHistory?.[actionIndex];
            const isCurrent = !task.completed && num === totalActions + 1;
            const isLast = num === 80;
            const isShinyPosition = num === shinyIndex;

            let tone: "muted" | "rose" | "sky" | "current" | "shiny" = "muted";
            if (isShinyPosition) tone = "shiny";
            else if (actionType === "shield") tone = "rose";
            else if (actionType === "normal") tone = "sky";
            else if (isCurrent) tone = "current";

            return (
              <div
                key={num}
                className={[
                  "aspect-square rounded-full transition-all duration-300",
                  "flex items-center justify-center text-[9px] font-bold",
                  getToneClass(tone),
                  showAnimation && isShinyPosition ? "scale-110 animate-pulse" : "",
                ].join(" ")}
              >
                {isShinyPosition ? (
                  <div className="relative h-full w-full overflow-hidden rounded-full ring-2 ring-amber-300/70">
                    <PetImage src={task.image} alt={`${task.petName} 异色`} className="h-full w-full rounded-full" />
                  </div>
                ) : (
                  <span className="text-[8px] font-bold">
                    {isLast && num > totalActions ? "保底" : !isLast ? num : ""}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <span>污染：{task.shieldBreakCount}</span>
          <span>原色：{task.normalCaughtCount}</span>
          <span>总计：{totalActions}/80</span>
          <span>剩余：{Math.max(0, 80 - totalActions)}</span>
        </div>
      </div>
    </Card>
  );
}

function getToneClass(tone: "muted" | "rose" | "sky" | "current" | "shiny") {
  const classes = {
    muted: "bg-muted/50 text-muted-foreground",
    rose: "bg-rose-500 text-white",
    sky: "bg-sky-500 text-white",
    current: "bg-rose-200 text-rose-700 ring-2 ring-rose-500",
    shiny: "bg-amber-100 text-amber-800 ring-2 ring-amber-400/70",
  };
  return classes[tone];
}

function getStatusBadgeClass(status: Task["shinyStatus"]) {
  if (status === "保底获取") return "bg-emerald-100 text-emerald-700";
  if (status === "概率获取") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}
