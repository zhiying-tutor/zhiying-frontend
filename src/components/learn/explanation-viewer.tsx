"use client";

import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Skeleton } from "@/components/ui/skeleton";
import { knowledgeExplanationSchema } from "@/lib/api/schemas";
import { useResource } from "@/lib/query/resource";

import { MarkmapView } from "./markmap";

export function ExplanationViewer({ id }: { id: number }) {
  const { data, isPending, isError, error } = useResource({
    kind: "knowledge-explanations",
    id,
    schema: knowledgeExplanationSchema,
  });

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <Skeleton className="h-[480px] w-full rounded-2xl" />
        <Skeleton className="h-[480px] w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "加载失败"}
      </div>
    );
  }

  if (data.status === "FAILED") {
    return (
      <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 py-8 text-center text-sm text-destructive">
        知识讲解生成失败，请稍后重试
      </div>
    );
  }

  if (data.status !== "FINISHED" || !data.content) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/40 bg-white/60 px-6 py-12 text-sm text-brand-medium">
        <Loader2 className="size-4 animate-spin" />
        知识讲解生成中…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
      <article className="rounded-2xl border border-border/30 bg-white/85 p-6 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-8 [&_code]:rounded [&_code]:bg-muted/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-extrabold [&_h1]:text-brand-dark [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-brand-dark [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-brand-dark [&_li]:my-1 [&_p]:my-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-brand-medium [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted/60 [&_pre]:p-3 [&_pre]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_table]:my-3 [&_table]:w-full [&_table]:text-sm [&_td]:border [&_td]:border-border/30 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-border/30 [&_th]:bg-muted/40 [&_th]:px-2 [&_th]:py-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[15px] [&_ul]:leading-relaxed [&_ul]:text-brand-medium">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
      </article>
      <div className="h-[480px] overflow-hidden rounded-2xl border border-border/30 bg-white/85 p-2 shadow-[var(--shadow-soft)] backdrop-blur-md">
        <MarkmapView markdown={data.content} />
      </div>
    </div>
  );
}
