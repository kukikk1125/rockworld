"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  hideCancel?: boolean;
  confirmVariant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  hideCancel = false,
  confirmVariant = "destructive",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4">
      <Card className="w-full max-w-md border-border/80 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          {!hideCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
