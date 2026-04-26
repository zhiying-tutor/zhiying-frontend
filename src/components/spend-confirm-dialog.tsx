"use client";

import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SpendCurrency = "diamond" | "gold";

const CURRENCY_META: Record<
  SpendCurrency,
  { icon: string; label: string; chipBg: string; chipText: string; afterBg: string }
> = {
  diamond: {
    icon: "💎",
    label: "钻石",
    chipBg: "bg-palette-blue-mist",
    chipText: "text-palette-blue",
    afterBg: "bg-palette-blue-mist/60",
  },
  gold: {
    icon: "🪙",
    label: "金币",
    chipBg: "bg-palette-yellow-light",
    chipText: "text-palette-orange",
    afterBg: "bg-palette-yellow-light/60",
  },
};

export interface SpendConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  currency: SpendCurrency;
  amount: number;
  costLabel?: string;
  currentBalance: number;
  refundHint?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function SpendConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  currency,
  amount,
  costLabel,
  currentBalance,
  refundHint,
  confirmText,
  cancelText = "取消",
  loading = false,
  onConfirm,
}: SpendConfirmDialogProps) {
  const meta = CURRENCY_META[currency];
  const after = currentBalance - amount;
  const insufficient = after < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-palette-yellow-light to-palette-orange-lighter text-3xl shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_20%,transparent)]">
            {meta.icon}
          </div>
          <DialogTitle className="text-lg font-extrabold text-brand-dark">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm text-brand-medium">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl ${meta.chipBg} px-5 py-3`}
          >
            <span className="text-xl">{meta.icon}</span>
            <span className={`text-2xl font-black ${meta.chipText}`}>
              -{amount}
            </span>
            <span className="text-sm font-semibold text-brand-medium">
              {costLabel ?? `${meta.label}消耗`}
            </span>
          </div>

          <div
            className={`flex items-center justify-center gap-2 rounded-2xl ${meta.afterBg} px-4 py-2 text-sm font-semibold ${
              insufficient ? "text-destructive" : "text-brand-dark"
            }`}
          >
            <span>操作后余额</span>
            <span>➜</span>
            <span>{meta.icon}</span>
            <span className="text-base font-black">{after}</span>
          </div>

          {refundHint ? (
            <div className="rounded-2xl bg-palette-green-lighter px-4 py-2 text-center text-xs font-semibold text-brand-dark">
              {refundHint}
            </div>
          ) : null}

          {insufficient ? (
            <div className="rounded-2xl bg-danger-surface px-4 py-2 text-center text-xs font-semibold text-destructive">
              ⚠️ 余额不足，还差 {Math.abs(after)} {meta.label}
            </div>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => onConfirm()}
            disabled={loading || insufficient}
            className="bg-gradient-to-br from-palette-yellow to-palette-orange font-bold text-brand-dark hover:opacity-90"
          >
            {loading ? "处理中…" : (confirmText ?? `${meta.icon} 确认消耗`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
