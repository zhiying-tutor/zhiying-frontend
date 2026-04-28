"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import {
  studySubjectListQueryKey,
  useStudySubjectList,
} from "@/lib/query/study-subject";
import type { StudySubject } from "@/lib/api/schemas";

const STATUS_LABEL: Record<StudySubject["status"], string> = {
  PRETEST_QUEUING: "学前测排队中",
  PRETEST_GENERATING: "学前测生成中",
  PRETEST_READY: "学前测就绪",
  PLAN_QUEUING: "计划排队中",
  PLAN_GENERATING: "计划生成中",
  STUDYING: "学习中",
  FINISHED: "已完成",
  FAILED: "失败",
};

const STATUS_TONE: Record<StudySubject["status"], string> = {
  PRETEST_QUEUING: "bg-palette-yellow-light text-brand-dark",
  PRETEST_GENERATING: "bg-palette-yellow-light text-brand-dark",
  PRETEST_READY: "bg-palette-orange-lighter text-brand-dark",
  PLAN_QUEUING: "bg-palette-blue-mist text-brand-dark",
  PLAN_GENERATING: "bg-palette-blue-mist text-brand-dark",
  STUDYING: "bg-palette-orange-lighter text-brand-dark",
  FINISHED: "bg-palette-green-lighter text-brand-dark",
  FAILED: "bg-danger-surface text-destructive",
};

export function SubjectList({
  initialData,
}: {
  initialData: StudySubject[];
}) {
  const queryClient = useQueryClient();
  const { data: subjects = initialData } = useStudySubjectList({ initialData });

  // Push fresh RSC data into the cache when revalidatePath produces new props
  // (e.g. after createSubjectAction). Without this, server actions wouldn't
  // visibly update the list until the next navigation.
  useEffect(() => {
    queryClient.setQueryData(studySubjectListQueryKey(), initialData);
  }, [queryClient, initialData]);

  return (
    <ul className="flex flex-col gap-3">
      {subjects.map((s) => {
        const progress =
          s.total_stages > 0
            ? Math.round((s.finished_stages / s.total_stages) * 100)
            : 0;
        return (
          <li
            key={s.id}
            className="flex flex-col gap-3 rounded-3xl border border-border/30 bg-white/70 p-5 shadow-[var(--shadow-soft)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-lg">📌</span>
                <span className="truncate text-base font-bold text-brand-dark">
                  {s.subject}
                </span>
                <Badge
                  className={`shrink-0 ${STATUS_TONE[s.status]}`}
                  variant="secondary"
                >
                  {STATUS_LABEL[s.status]}
                </Badge>
              </div>
              <span className="shrink-0 text-sm font-bold text-brand-medium">
                Day {s.finished_stages}/{s.total_stages}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-palette-orange to-palette-yellow transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
