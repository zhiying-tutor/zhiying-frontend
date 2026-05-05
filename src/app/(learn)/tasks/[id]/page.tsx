import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ExplanationViewer } from "@/components/learn/explanation-viewer";
import { InteractiveHtmlViewer } from "@/components/learn/interactive-html-viewer";
import { VideoViewer } from "@/components/learn/video-viewer";
import { buttonVariants } from "@/components/ui/button";
import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { studyTaskSchema, type StudyTask } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

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

  const hasResource =
    task.knowledge_video_id != null ||
    task.interactive_html_id != null ||
    task.knowledge_explanation_id != null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1080px] flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "rounded-full text-brand-medium",
          )}
        >
          <ArrowLeft className="size-4" />
          返回主页
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          {task.title}
        </h1>
        <p
          className="text-[15px] leading-relaxed text-brand-medium"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {task.description}
        </p>
      </header>

      {task.knowledge_video_id != null && (
        <VideoViewer id={task.knowledge_video_id} />
      )}
      {task.interactive_html_id != null && (
        <InteractiveHtmlViewer id={task.interactive_html_id} />
      )}
      {task.knowledge_explanation_id != null && (
        <ExplanationViewer id={task.knowledge_explanation_id} />
      )}

      {!hasResource && (
        <div className="rounded-2xl border-2 border-dashed border-border/30 bg-white/60 px-6 py-10 text-center">
          <p className="text-sm font-bold text-brand-dark">该任务暂无内容资源</p>
          <p className="mt-2 text-xs leading-relaxed text-brand-medium">
            该任务尚未关联任何视频 / 互动 HTML / 文字讲解资源。
          </p>
        </div>
      )}
    </div>
  );
}
