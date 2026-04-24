import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { serverFetch } from "@/lib/api/client";
import {
  studySubjectListSchema,
  type StudySubject,
} from "@/lib/api/schemas";

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

export default async function DashboardPage() {
  const subjects = await serverFetch<StudySubject[]>("/study-subjects", {
    schema: studySubjectListSchema,
  });

  return (
    <div className="flex flex-col gap-16 px-12 py-10 pb-24 lg:px-20">
      <header className="flex flex-col items-center text-center">
        <h1 className="mb-8 bg-gradient-to-br from-brand-dark to-palette-orange bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
          智映通学
          <span className="ml-1 animate-pulse font-normal text-palette-orange [text-shadow:0_0_10px_color-mix(in_oklch,var(--palette-orange)_50%,transparent)]">
            |
          </span>
        </h1>

        <div className="relative w-full max-w-[680px]">
          <div className="flex h-[60px] items-center rounded-3xl border-2 border-palette-yellow-light bg-white/95 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05),inset_-2px_-2px_6px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <div className="flex h-full cursor-not-allowed items-center gap-2 border-r border-border/30 px-6 text-[15px] font-semibold text-brand-medium select-none">
              全部
              <span className="text-[10px]">▼</span>
            </div>
            <div className="flex flex-1 items-center gap-3 px-6 text-base text-brand-light">
              <Search className="size-4" />
              <span className="font-medium">搜索知识点、计划或问题…</span>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[900px]">
        {subjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-extrabold text-brand-dark">
              我的学习计划
            </h2>
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
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-[680px] flex-col items-center rounded-[28px] border-2 border-dashed border-border/25 bg-white/60 px-10 py-16 text-center shadow-[var(--shadow-soft)]">
      <div className="mb-6 text-6xl drop-shadow-[0_4px_8px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)]">
        🚀
      </div>
      <h2 className="mb-3 text-2xl font-extrabold text-brand-dark">
        还没有学习计划
      </h2>
      <p className="mb-8 max-w-[400px] text-[15px] leading-relaxed text-brand-medium">
        创建你的第一个个性化学习计划，AI 将为你量身定制学习路线、知识点和每日任务
      </p>
      <button
        type="button"
        disabled
        className="flex h-[52px] cursor-not-allowed items-center gap-2 rounded-full bg-gradient-to-br from-palette-yellow to-palette-orange px-9 text-base font-bold text-brand-dark opacity-70 shadow-[0_4px_16px_color-mix(in_oklch,var(--palette-orange)_35%,transparent)]"
      >
        <span>🚀</span> 创建第一个学习计划（即将开放）
      </button>
    </div>
  );
}
