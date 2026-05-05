"use client";

import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { knowledgeVideoSchema } from "@/lib/api/schemas";
import { useConfig } from "@/lib/query/config";
import { useResource } from "@/lib/query/resource";
import { assetUrl } from "@/lib/storage";

export function VideoViewer({ id }: { id: number }) {
  const { storage } = useConfig();
  const { data, isPending, isError, error } = useResource({
    kind: "knowledge-videos",
    id,
    schema: knowledgeVideoSchema,
  });

  if (isPending) return <ViewerSkeleton aspect="video" />;

  if (isError) {
    return (
      <ViewerError message={error instanceof Error ? error.message : "加载失败"} />
    );
  }

  if (data.status === "FAILED") {
    return <ViewerError message="视频生成失败，请稍后重试" />;
  }

  if (data.status !== "FINISHED" || !data.object_key) {
    return <ViewerPending label="知识视频生成中…" />;
  }

  return (
    <video
      controls
      className="aspect-video w-full rounded-2xl bg-black"
      src={assetUrl(data.object_key, storage)}
    />
  );
}

function ViewerSkeleton({ aspect }: { aspect: "video" | "square" }) {
  return (
    <Skeleton
      className={
        aspect === "video"
          ? "aspect-video w-full rounded-2xl"
          : "aspect-square w-full rounded-2xl"
      }
    />
  );
}

function ViewerPending({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border/40 bg-white/60 text-sm text-brand-medium">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

function ViewerError({ message }: { message: string }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 px-6 text-center text-sm text-destructive">
      {message}
    </div>
  );
}
