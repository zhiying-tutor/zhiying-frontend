"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { createStudyQuizAction } from "@/app/(learn)/tasks/[id]/actions";
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

const DEFAULT_PROMPT = "围绕本任务知识点出 5 道单选题，覆盖核心要点。";

export function NewQuizDialog({
  open,
  onOpenChange,
  taskId,
  cost,
  isFree,
  goldBalance,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number;
  cost: number;
  isFree: boolean;
  goldBalance: number;
  onSuccess: (quizId: number) => void;
}) {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) setPrompt(DEFAULT_PROMPT);
  }, [open]);

  const trimmed = prompt.trim();
  const after = goldBalance - (isFree ? 0 : cost);
  const insufficient = !isFree && after < 0;
  const submitDisabled = trimmed.length === 0 || isPending || insufficient;

  function handleConfirm() {
    if (submitDisabled) return;
    startTransition(async () => {
      const result = await createStudyQuizAction(taskId, trimmed);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        isFree ? "已加入生成队列，请稍候" : "已扣费并加入生成队列，请稍候",
      );
      onOpenChange(false);
      onSuccess(result.data.quiz_id);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-3 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-palette-yellow-light to-palette-orange-lighter text-3xl shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_20%,transparent)]">
            📝
          </div>
          <DialogTitle className="text-lg font-extrabold text-brand-dark">
            生成新一轮知识点测验
          </DialogTitle>
          <DialogDescription className="text-sm text-brand-medium">
            AI 将根据提示词为本任务出一组单选题
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={isPending}
            className="w-full resize-none rounded-2xl border border-white/70 bg-white/70 text-sm font-medium text-brand-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] placeholder:text-brand-light"
          />

          {isFree ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-palette-green-lighter px-5 py-3 text-sm font-semibold text-brand-dark">
              <span className="text-xl">🎁</span>
              <span>本轮免费</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-palette-yellow-light px-5 py-3">
                <span className="text-xl">🪙</span>
                <span className="text-2xl font-black text-palette-orange">
                  -{cost}
                </span>
                <span className="text-sm font-semibold text-brand-medium">
                  金币消耗
                </span>
              </div>
              <div
                className={`flex items-center justify-center gap-2 rounded-2xl bg-palette-yellow-light/60 px-4 py-2 text-sm font-semibold ${
                  insufficient ? "text-destructive" : "text-brand-dark"
                }`}
              >
                <span>操作后余额</span>
                <span>➜</span>
                <span>🪙</span>
                <span className="text-base font-black">{after}</span>
              </div>
              {insufficient ? (
                <div className="rounded-2xl bg-danger-surface px-4 py-2 text-center text-xs font-semibold text-destructive">
                  ⚠️ 余额不足，还差 {Math.abs(after)} 金币
                </div>
              ) : null}
              <div className="rounded-2xl bg-palette-green-lighter px-4 py-2 text-center text-xs font-semibold text-brand-dark">
                若生成失败，系统会自动退还消耗
              </div>
            </>
          )}
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
            {isPending ? "处理中…" : isFree ? "🚀 开始测验" : "🪙 确认消耗"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
