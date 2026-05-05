"use client";

import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { interactiveHtmlSchema } from "@/lib/api/schemas";
import { useConfig } from "@/lib/query/config";
import { useResource } from "@/lib/query/resource";
import { assetUrl } from "@/lib/storage";

export function InteractiveHtmlViewer({ id }: { id: number }) {
  const { storage } = useConfig();
  const { data, isPending, isError, error } = useResource({
    kind: "interactive-htmls",
    id,
    schema: interactiveHtmlSchema,
  });

  if (isPending) {
    return <Skeleton className="aspect-video w-full rounded-2xl" />;
  }

  if (isError) {
    return (
      <Message
        tone="error"
        text={error instanceof Error ? error.message : "加载失败"}
      />
    );
  }

  if (data.status === "FAILED") {
    return <Message tone="error" text="互动 HTML 生成失败，请稍后重试" />;
  }

  if (data.status !== "FINISHED" || !data.object_key) {
    return (
      <Message tone="pending" text="互动 HTML 生成中…">
        <Loader2 className="size-4 animate-spin" />
      </Message>
    );
  }

  return (
    <iframe
      title="interactive-html"
      src={assetUrl(data.object_key, storage)}
      sandbox="allow-scripts"
      className="aspect-video w-full rounded-2xl border border-border/40 bg-white"
    />
  );
}

function Message({
  tone,
  text,
  children,
}: {
  tone: "pending" | "error";
  text: string;
  children?: React.ReactNode;
}) {
  const toneClass =
    tone === "error"
      ? "border-destructive/40 bg-destructive/5 text-destructive"
      : "border-border/40 bg-white/60 text-brand-medium";
  return (
    <div
      className={`flex aspect-video w-full items-center justify-center gap-2 rounded-2xl border border-dashed px-6 text-center text-sm ${toneClass}`}
    >
      {children}
      {text}
    </div>
  );
}
