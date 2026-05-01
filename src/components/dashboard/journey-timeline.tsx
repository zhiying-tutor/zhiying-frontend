"use client";

import { Check, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useStudyStage,
  useSubjectStages,
} from "@/lib/query/study-stage";
import { cn } from "@/lib/utils";
import type {
  StudyStageListItem,
  StudySubject,
  StudyTaskBrief,
} from "@/lib/api/schemas";

export function JourneyTimeline({ subject }: { subject: StudySubject }) {
  const overallProgress =
    subject.total_stages > 0
      ? Math.round((subject.finished_stages / subject.total_stages) * 100)
      : 0;
  const stagesQuery = useSubjectStages(subject.id);
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());

  function toggle(stageId: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  }

  return (
    <Card className="flex flex-col gap-6 rounded-3xl border border-border/30 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-brand-dark">学习中</h3>
          <span className="text-sm font-bold text-brand-medium">
            Day {subject.finished_stages}/{subject.total_stages}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-palette-orange to-palette-yellow transition-[width] duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {stagesQuery.isPending ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : stagesQuery.isError ? (
        <p className="text-sm text-destructive">
          加载阶段失败：{stagesQuery.error.message}
        </p>
      ) : stagesQuery.data.length === 0 ? (
        <p className="text-sm text-brand-medium">暂无阶段。</p>
      ) : (
        <div className="flex flex-col gap-3">
          {stagesQuery.data.map((stage) => (
            <StageRow
              key={stage.id}
              stage={stage}
              expanded={expanded.has(stage.id)}
              onToggle={() => toggle(stage.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}

function StageRow({
  stage,
  expanded,
  onToggle,
}: {
  stage: StudyStageListItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const locked = stage.status === "LOCKED";
  const finished = stage.status === "FINISHED";
  const studying = stage.status === "STUDYING";
  const stageProgress =
    stage.total_tasks > 0
      ? Math.round((stage.finished_tasks / stage.total_tasks) * 100)
      : 0;

  const badgeClass = cn(
    "flex size-16 shrink-0 items-center justify-center rounded-full text-lg font-black transition",
    finished && "bg-palette-green-lighter text-brand-dark",
    studying &&
      "bg-gradient-to-br from-palette-yellow to-palette-orange text-brand-dark",
    locked && "bg-border/30 text-brand-light",
  );

  const rowClass = cn(
    "flex w-full items-stretch gap-4 rounded-2xl border-2 bg-white px-4 py-4 text-left transition",
    "shadow-[var(--shadow-soft)]",
    locked
      ? "cursor-not-allowed border-border/25 opacity-70"
      : "cursor-pointer border-palette-yellow-light/80 hover:-translate-y-0.5 hover:border-palette-orange/60",
  );

  return (
    <div className="flex flex-col gap-0">
      <button
        type="button"
        onClick={locked ? undefined : onToggle}
        disabled={locked}
        aria-expanded={expanded}
        className={rowClass}
      >
        <div className={badgeClass}>
          {locked ? (
            <Lock className="size-5" />
          ) : finished ? (
            <Check className="size-6" />
          ) : (
            stage.sort_order
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-brand-dark">
                {stage.title}
              </span>
              <span
                className="text-xs leading-relaxed text-brand-medium"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {stage.description}
              </span>
            </div>
            {!locked && (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-brand-medium transition-transform",
                  expanded && "rotate-180",
                )}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border/15">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  finished
                    ? "bg-palette-green"
                    : "bg-gradient-to-r from-palette-orange to-palette-yellow",
                )}
                style={{ width: `${stageProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-brand-medium">
              {stage.finished_tasks}/{stage.total_tasks}
            </span>
          </div>
        </div>
      </button>

      {expanded && !locked && (
        <StageTaskList stageId={stage.id} />
      )}
    </div>
  );
}

function StageTaskList({ stageId }: { stageId: number }) {
  const detail = useStudyStage(stageId, { enabled: true });

  if (detail.isPending) {
    return (
      <div className="ml-20 mt-2 flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }
  if (detail.isError) {
    return (
      <p className="ml-20 mt-2 text-xs text-destructive">
        加载任务失败：{detail.error.message}
      </p>
    );
  }
  if (detail.data.tasks.length === 0) {
    return (
      <p className="ml-20 mt-2 text-xs text-brand-medium">
        暂无任务。
      </p>
    );
  }

  return (
    <ol className="ml-20 mt-2 flex flex-col gap-2 border-l-2 border-dashed border-border/30 pl-4">
      {detail.data.tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ol>
  );
}

function TaskItem({ task }: { task: StudyTaskBrief }) {
  const locked = task.status === "LOCKED";
  const finished = task.status === "FINISHED";
  const studying = task.status === "STUDYING";

  const dotClass = cn(
    "size-2.5 shrink-0 rounded-full",
    finished && "bg-palette-green",
    studying && "bg-palette-orange",
    locked && "bg-border/40",
  );

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/25 bg-white px-3 py-2.5 transition",
        !locked && "hover:border-palette-orange/60 hover:bg-palette-orange-lighter/15",
        locked && "opacity-60",
      )}
    >
      <span className={dotClass} />
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-brand-dark">{task.title}</span>
        <span
          className="text-xs leading-relaxed text-brand-medium"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {task.description}
        </span>
      </div>
    </div>
  );

  if (locked) {
    return content;
  }
  return (
    <Link href={`/tasks/${task.id}`} className="block">
      {content}
    </Link>
  );
}
