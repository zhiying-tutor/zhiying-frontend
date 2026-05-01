import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="flex w-full max-w-[640px] flex-col gap-6 rounded-3xl border border-border/30 bg-white/85 p-8 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-10">
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
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-extrabold text-brand-dark">
            {task.title}
          </h1>
          <p
            className="text-[15px] leading-relaxed text-brand-medium"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {task.description}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-dashed border-border/30 bg-white/60 px-6 py-8 text-center">
          <p className="text-sm font-bold text-brand-dark">
            🚧 任务详情页建设中
          </p>
          <p className="mt-2 text-xs leading-relaxed text-brand-medium">
            知识视频 / 互动 HTML / 文字讲解 / 小测的实际学习页将在下一阶段上线。
          </p>
        </div>
      </Card>
    </div>
  );
}
