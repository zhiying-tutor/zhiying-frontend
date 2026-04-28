"use client";

import {
  AlertTriangle,
  PartyPopper,
  Sparkles,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { StudySubject } from "@/lib/api/schemas";

function StateCard({
  icon,
  title,
  description,
  action,
  tone = "info",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "info" | "success" | "danger";
}) {
  const accent =
    tone === "danger"
      ? "from-danger-surface/60 to-canvas"
      : tone === "success"
        ? "from-palette-green-lighter/40 to-canvas"
        : "from-palette-orange-lighter/40 to-canvas";
  return (
    <Card
      className={`flex flex-col items-center gap-5 rounded-3xl border border-border/30 bg-gradient-to-br ${accent} px-10 py-12 text-center shadow-[var(--shadow-soft)]`}
    >
      <div className="text-brand-medium">{icon}</div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
        <p className="max-w-[440px] text-sm leading-relaxed text-brand-medium">
          {description}
        </p>
      </div>
      {action}
    </Card>
  );
}

export function GeneratingCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <StateCard
      icon={<Spinner className="size-10" />}
      title={title}
      description={description}
    />
  );
}

export function PretestReadyCard({ subject }: { subject: StudySubject }) {
  return (
    <StateCard
      tone="success"
      icon={<Sparkles className="size-10 text-palette-orange" />}
      title="学前测已就绪"
      description="完成几道题，让 AI 看到你目前的水平，再为你定制专属的学习路线。"
      action={
        <Link
          href={`/pretest/${subject.id}`}
          className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}
        >
          <PlayCircle className="size-5" />
          去答题
        </Link>
      }
    />
  );
}

export function FinishedCard({ subject }: { subject: StudySubject }) {
  return (
    <StateCard
      tone="success"
      icon={<PartyPopper className="size-10 text-palette-orange" />}
      title="计划已完成"
      description={`你已经完成「${subject.subject}」的全部 ${subject.total_stages} 个阶段，去开启下一个吧。`}
    />
  );
}

export function FailedCard({ subject }: { subject: StudySubject }) {
  return (
    <StateCard
      tone="danger"
      icon={<AlertTriangle className="size-10 text-destructive" />}
      title="计划生成失败"
      description={`「${subject.subject}」生成时出错，已按花费退款。可以重新创建一个计划再试。`}
    />
  );
}

export function JourneyV1Placeholder({ subject }: { subject: StudySubject }) {
  const progress =
    subject.total_stages > 0
      ? Math.round((subject.finished_stages / subject.total_stages) * 100)
      : 0;
  return (
    <Card className="flex flex-col gap-4 rounded-3xl border border-border/30 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-brand-dark">学习中</h3>
        <span className="text-sm font-bold text-brand-medium">
          Day {subject.finished_stages}/{subject.total_stages}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-palette-orange to-palette-yellow transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-brand-medium">
        各阶段任务详情正在准备中，稍后会以时间轴的形式展现。
      </p>
    </Card>
  );
}
