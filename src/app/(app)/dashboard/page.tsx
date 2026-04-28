import { Search } from "lucide-react";
import { redirect } from "next/navigation";

import { CreateSubjectButton } from "@/components/dashboard/create-subject-button";
import { FeatureGrid } from "@/components/dashboard/feature-grid";
import { SubjectList } from "@/components/dashboard/subject-list";
import { serverFetch } from "@/lib/api/client";
import { getPublicConfig } from "@/lib/api/public-config";
import {
  studySubjectListSchema,
  type StudySubject,
  type StudySubjectPricingItem,
} from "@/lib/api/schemas";
import { getSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const [user, subjects, config] = await Promise.all([
    getSession(),
    serverFetch<StudySubject[]>("/study-subjects", {
      schema: studySubjectListSchema,
    }),
    getPublicConfig(),
  ]);
  if (!user) redirect("/login");

  const pricing = config.study_subject.pricing;

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
          <EmptyState pricing={pricing} currentDiamond={user.diamond} />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold text-brand-dark">
                我的学习计划
              </h2>
              <CreateSubjectButton
                pricing={pricing}
                currentDiamond={user.diamond}
                variant="ghost"
                label="🚀 新建计划"
              />
            </div>
            <SubjectList initialData={subjects} />
          </div>
        )}
      </section>

      <FeatureGrid />
    </div>
  );
}

function EmptyState({
  pricing,
  currentDiamond,
}: {
  pricing: StudySubjectPricingItem[];
  currentDiamond: number;
}) {
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
      <CreateSubjectButton
        pricing={pricing}
        currentDiamond={currentDiamond}
        label="🚀 创建第一个学习计划"
      />
    </div>
  );
}
