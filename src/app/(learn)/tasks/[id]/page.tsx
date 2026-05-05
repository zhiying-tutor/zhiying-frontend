import { redirect } from "next/navigation";

import { ExplanationViewer } from "@/components/learn/explanation-viewer";
import { InteractiveHtmlViewer } from "@/components/learn/interactive-html-viewer";
import { MarkmapCard } from "@/components/learn/markmap-card";
import { TaskSidebar } from "@/components/learn/task-sidebar";
import { VideoViewer } from "@/components/learn/video-viewer";
import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  studyStageDetailSchema,
  studyTaskSchema,
  type StudyStageDetail,
  type StudyTask,
} from "@/lib/api/schemas";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId <= 0) {
    redirect("/dashboard");
  }

  let task: StudyTask;
  try {
    task = await serverFetch<StudyTask>(`/study-tasks/${taskId}`, {
      schema: studyTaskSchema,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      redirect("/dashboard");
    }
    throw err;
  }

  let stage: StudyStageDetail | null = null;
  try {
    stage = await serverFetch<StudyStageDetail>(
      `/study-stages/${task.study_stage_id}`,
      { schema: studyStageDetailSchema },
    );
  } catch {
    stage = null;
  }

  const hasResource =
    task.knowledge_video_id != null ||
    task.interactive_html_id != null ||
    task.knowledge_explanation_id != null;

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      <main className="flex flex-1 flex-col gap-10 overflow-y-auto px-8 py-10 sm:px-16 sm:py-14 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-border-muted [&::-webkit-scrollbar-thumb:hover]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
        <header className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-xl bg-gradient-to-br from-palette-yellow-light to-palette-orange-light px-[18px] py-1.5 text-sm font-extrabold tracking-wide text-brand-deep shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)]">
            🎯 学习任务
          </span>
          <h1 className="bg-gradient-to-br from-brand-dark to-palette-orange bg-clip-text text-4xl font-black leading-tight tracking-tight text-transparent sm:text-5xl [text-shadow:0_4px_12px_color-mix(in_oklch,var(--brand-gold)_20%,transparent)]">
            {task.title}
          </h1>
          <p
            className="max-w-[720px] text-base font-medium leading-[1.7] text-brand-medium"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {task.description}
          </p>
        </header>

        {task.knowledge_explanation_id != null && (
          <>
            <MarkmapCard id={task.knowledge_explanation_id} />
            <ExplanationViewer id={task.knowledge_explanation_id} />
          </>
        )}
        {task.knowledge_video_id != null && (
          <VideoViewer id={task.knowledge_video_id} />
        )}
        {task.interactive_html_id != null && (
          <InteractiveHtmlViewer id={task.interactive_html_id} />
        )}

        {!hasResource && (
          <div className="rounded-2xl border-2 border-dashed border-border-strong/30 bg-white/60 px-6 py-10 text-center">
            <p className="text-sm font-bold text-brand-dark">
              该任务暂无内容资源
            </p>
            <p className="mt-2 text-xs leading-relaxed text-brand-medium">
              该任务尚未关联任何视频 / 互动 HTML / 文字讲解资源。
            </p>
          </div>
        )}
      </main>

      <TaskSidebar task={task} stage={stage} />
    </div>
  );
}
