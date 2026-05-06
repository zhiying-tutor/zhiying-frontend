"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { completeTaskAction } from "@/app/(learn)/tasks/[id]/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { StudyTaskStatus } from "@/lib/api/schemas";

import { ContentCard } from "./content-card";

export function TaskCompleteCard({
  taskId,
  taskStatus,
  nextTaskId,
}: {
  taskId: number;
  taskStatus: StudyTaskStatus;
  nextTaskId: number | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const finished = taskStatus === "FINISHED";
  const locked = taskStatus === "LOCKED";

  const onConfirm = () => {
    startTransition(async () => {
      const result = await completeTaskAction(taskId);
      if (result.ok) {
        toast.success("已记录学习进度，继续加油!");
        setConfirmOpen(false);
      } else {
        toast.error(result.message);
        setConfirmOpen(false);
      }
    });
  };

  const ctaClassName =
    "inline-flex items-center justify-center gap-1 rounded-4xl bg-gradient-to-br from-palette-yellow to-palette-orange px-7 py-2 text-base font-bold text-brand-dark shadow-[0_4px_16px_color-mix(in_oklch,var(--palette-orange)_35%,transparent)] hover:opacity-90";

  return (
    <ContentCard
      theme="yellow"
      icon={<CheckCircle2 />}
      title="学完打卡"
      subtitle="完成本任务并解锁下一节"
    >
      <div className="relative overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--palette-yellow-light)_50%,transparent)] bg-gradient-to-br from-palette-yellow-light/40 to-palette-orange-lighter/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4)_0%,transparent_60%)]"
        />
        <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
          <CheckCircle2
            className="size-14 stroke-brand-gold [filter:drop-shadow(0_4px_12px_color-mix(in_oklch,var(--palette-orange)_30%,transparent))]"
            strokeWidth={1.6}
          />
          <p className="text-sm font-bold text-brand-medium">
            {finished
              ? nextTaskId != null
                ? "本任务已完成，下一节已解锁"
                : "本阶段已学完，回到主控台继续学习之旅"
              : "看完所有内容后，点击下方按钮完成本任务"}
          </p>
          {finished ? (
            nextTaskId != null ? (
              <Link href={`/tasks/${nextTaskId}`} className={ctaClassName}>
                前往下一个任务
                <ArrowRight className="ml-1 size-4" />
              </Link>
            ) : (
              <Link href="/dashboard" className={ctaClassName}>
                返回主控台
                <ArrowRight className="ml-1 size-4" />
              </Link>
            )
          ) : (
            <Button
              type="button"
              disabled={locked || isPending}
              onClick={() => setConfirmOpen(true)}
              className="bg-gradient-to-br from-palette-yellow to-palette-orange px-7 py-2 text-base font-bold text-brand-dark shadow-[0_4px_16px_color-mix(in_oklch,var(--palette-orange)_35%,transparent)] hover:opacity-90 disabled:opacity-60"
            >
              {locked ? "请先完成前置任务" : "我已学完，完成本任务"}
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>完成本任务?</AlertDialogTitle>
            <AlertDialogDescription>
              完成后将解锁下一任务，无法撤回。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isPending}
              className="bg-gradient-to-br from-palette-yellow to-palette-orange font-bold text-brand-dark hover:opacity-90"
            >
              {isPending ? "处理中…" : "确认完成"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ContentCard>
  );
}
