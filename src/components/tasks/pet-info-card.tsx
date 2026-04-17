import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export function PetInfoCard({ task }: { task: Task }) {
  return (
    <Card className="p-3">
      <div className="flex gap-3">
        <PetImage src={task.image} alt={task.petName} className="aspect-square w-16 rounded-[18px]" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap gap-1">
            <Badge className="bg-rose-100 text-[9px] text-rose-700">{task.petType}</Badge>
            <Badge className="bg-amber-100 text-[9px] text-amber-700">{task.mode}</Badge>
          </div>
          <h2 className="text-sm font-black leading-tight">{task.petName || "未命名任务"}</h2>
          <p className="mt-1 text-[10px] text-muted-foreground">{task.familyOrType || "未设置系别/类型"}</p>
        </div>
      </div>
    </Card>
  );
}
