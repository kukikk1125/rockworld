"use client";

import { Card } from "@/components/ui/card";

export default function EditTaskLoader() {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm text-muted-foreground">当前版本请直接进入任务页继续记录，暂不单独提供编辑页。</p>
    </Card>
  );
}
