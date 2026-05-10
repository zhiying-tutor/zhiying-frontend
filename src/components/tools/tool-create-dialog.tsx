"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export type ToolCreateMode =
  | { kind: "single"; placeholder: string; defaultValue?: string }
  | {
      kind: "code-pair";
      problemPlaceholder: string;
      codePlaceholder: string;
    };

export interface ToolCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  mode: ToolCreateMode;
  currency: "diamond" | "gold";
  cost: number;
  currentBalance: number;
  onSubmit: (
    prompt: string,
  ) => Promise<{ ok: true; id: number } | { ok: false; message: string }>;
  onSuccess: (id: number) => void;
}

const CURRENCY_META = {
  diamond: { icon: "💎", label: "钻石" },
  gold: { icon: "🪙", label: "金币" },
} as const;

export function ToolCreateDialog({
  open,
  onOpenChange,
  title,
  description,
  mode,
  currency,
  cost,
  currentBalance,
  onSubmit,
  onSuccess,
}: ToolCreateDialogProps) {
  const [text, setText] = useState("");
  const [problem, setProblem] = useState("");
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setText(mode.kind === "single" ? (mode.defaultValue ?? "") : "");
      setProblem("");
      setCode("");
    }
  }, [open, mode]);

  const trimmedSingle = text.trim();
  const trimmedProblem = problem.trim();
  const trimmedCode = code.trim();

  const after = currentBalance - cost;
  const insufficient = after < 0;

  const valid =
    mode.kind === "single"
      ? trimmedSingle.length > 0
      : trimmedProblem.length > 0 && trimmedCode.length > 0;

  const submitDisabled = !valid || isPending || insufficient;

  function buildPrompt(): string {
    if (mode.kind === "single") return trimmedSingle;
    return `# 题目\n${trimmedProblem}\n\n# 核心代码\n\`\`\`\n${trimmedCode}\n\`\`\``;
  }

  function handleConfirm() {
    if (submitDisabled) return;
    const prompt = buildPrompt();
    startTransition(async () => {
      const result = await onSubmit(prompt);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`已扣 ${cost} ${CURRENCY_META[currency].label}，正在生成…`);
      onOpenChange(false);
      onSuccess(result.id);
    });
  }

  const meta = CURRENCY_META[currency];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-palette-yellow-light to-palette-orange-lighter text-3xl shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_20%,transparent)]">
            <Sparkles className="size-8 text-palette-orange" />
          </div>
          <DialogTitle className="text-lg font-extrabold text-brand-dark">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-brand-medium">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {mode.kind === "single" ? (
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={4000}
              disabled={isPending}
              placeholder={mode.placeholder}
              className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 text-sm font-medium text-brand-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-brand-light"
            />
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-brand-dark">
                  题目描述
                </label>
                <Textarea
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={4}
                  maxLength={3000}
                  disabled={isPending}
                  placeholder={mode.problemPlaceholder}
                  className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 text-sm font-medium text-brand-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-brand-light"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-brand-dark">
                  核心代码
                </label>
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={6}
                  maxLength={6000}
                  disabled={isPending}
                  placeholder={mode.codePlaceholder}
                  className="w-full resize-none rounded-2xl border border-white/70 bg-white/80 font-mono text-[13px] text-brand-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-brand-light"
                />
              </div>
            </>
          )}

          <div
            className={`flex items-center justify-center gap-2 rounded-2xl px-5 py-3 ${
              currency === "diamond"
                ? "bg-palette-blue-mist"
                : "bg-palette-yellow-light"
            }`}
          >
            <span className="text-xl">{meta.icon}</span>
            <span
              className={`text-2xl font-black ${
                currency === "diamond" ? "text-palette-blue" : "text-palette-orange"
              }`}
            >
              -{cost}
            </span>
            <span className="text-sm font-semibold text-brand-medium">
              {meta.label}消耗
            </span>
          </div>
          <div
            className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
              currency === "diamond"
                ? "bg-palette-blue-mist/60"
                : "bg-palette-yellow-light/60"
            } ${insufficient ? "text-destructive" : "text-brand-dark"}`}
          >
            <span>操作后余额</span>
            <span>➜</span>
            <span>{meta.icon}</span>
            <span className="text-base font-black">{after}</span>
          </div>
          {insufficient ? (
            <div className="rounded-2xl bg-danger-surface px-4 py-2 text-center text-xs font-semibold text-destructive">
              ⚠️ 余额不足，还差 {Math.abs(after)} {meta.label}
            </div>
          ) : null}
          <div className="rounded-2xl bg-palette-green-lighter px-4 py-2 text-center text-xs font-semibold text-brand-dark">
            若生成失败，系统会自动退还消耗
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitDisabled}
            className="bg-gradient-to-br from-palette-yellow to-palette-orange font-bold text-brand-dark hover:opacity-90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                处理中…
              </>
            ) : (
              <>
                {meta.icon} 确认消耗 · 生成
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
