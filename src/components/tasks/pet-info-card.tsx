import { PetImage } from "@/components/tasks/pet-image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Task } from "@/types";

export function PetInfoCard({ task }: { task: Task }) {
  return (
    <Card className="p-3">
      <div className="flex gap-3">
        <PetImage
          src={task.image}
          alt={task.petName}
          className="aspect-square w-16 rounded-[18px]"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1 mb-1.5">
            <Badge className="bg-rose-100 text-rose-700 text-[9px]">{task.petType}</Badge>
            <Badge className="bg-amber-100 text-amber-700 text-[9px]">{task.mode}</Badge>
          </div>
          <h2 className="text-sm font-black leading-tight">
            {task.petName || "未命名任务"}
          </h2>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {task.familyOrType || "未设置系别/家族"}
          </p>
        </div>
      </div>
    </Card>
  );
}
