"use client";

import { useMemo, useState } from "react";
import { PetImage } from "@/components/tasks/pet-image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spirit } from "@/types";

export function SpiritPickerDialog({
  open,
  title,
  description,
  spirits,
  onClose,
  onSelect,
  allowCreate = false,
}: {
  open: boolean;
  title: string;
  description: string;
  spirits: Spirit[];
  onClose: () => void;
  onSelect: (payload: { spirit: Spirit; created: boolean }) => void;
  allowCreate?: boolean;
}) {
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    if (!query) return spirits;
    return spirits.filter((item) => item.name.toLowerCase().includes(query));
  }, [keyword, spirits]);

  if (!open) return null;

  const canCreate =
    allowCreate &&
    keyword.trim() &&
    !spirits.some((item) => item.name.trim() === keyword.trim());

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/55 p-4">
      <Card className="w-full max-w-md border-border/80 bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>

        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索精灵名称"
          className="mt-4"
        />

        <div className="mt-4 grid max-h-[380px] grid-cols-4 gap-3 overflow-y-auto">
          {filtered.map((spirit) => (
            <button
              key={spirit.id}
              type="button"
              onClick={() => onSelect({ spirit, created: false })}
              className="flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:bg-muted/40"
            >
              <PetImage
                src={spirit.image}
                alt={spirit.name}
                className="h-14 w-14 rounded-full border-2 border-amber-200"
              />
              <span className="text-[10px] font-medium text-center">{spirit.name}</span>
            </button>
          ))}
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() =>
              onSelect({
                spirit: {
                  id: keyword.trim().toLowerCase(),
                  name: keyword.trim(),
                },
                created: true,
              })
            }
            className="mt-4 w-full rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
          >
            新增精灵 “{keyword.trim()}”
          </button>
        )}
      </Card>
    </div>
  );
}
