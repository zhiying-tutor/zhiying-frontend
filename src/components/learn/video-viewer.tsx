"use client";

import { Film, Loader2, Play } from "lucide-react";
import type { ReactNode } from "react";

import { knowledgeVideoSchema } from "@/lib/api/schemas";
import { useConfig } from "@/lib/query/config";
import { useResource } from "@/lib/query/resource";
import { assetUrl } from "@/lib/storage";

import { ContentCard } from "./content-card";

export function VideoViewer({ id }: { id: number }) {
  const { storage } = useConfig();
  const { data, isPending, isError, error } = useResource({
    kind: "knowledge-videos",
    id,
    schema: knowledgeVideoSchema,
  });

  return (
    <ContentCard
      theme="blue"
      icon={<Film />}
      title="沉浸视界"
      subtitle="知识点视频化解析"
    >
      {isPending && <Placeholder />}

      {isError && (
        <Placeholder tone="error">
          {error instanceof Error ? error.message : "加载失败"}
        </Placeholder>
      )}

      {data?.status === "FAILED" && (
        <Placeholder tone="error">视频生成失败，请稍后重试</Placeholder>
      )}

      {data &&
        data.status !== "FAILED" &&
        (data.status !== "FINISHED" || !data.object_key) && (
          <Placeholder>
            <div className="flex items-center gap-2 text-sm font-bold text-brand-medium">
              <Loader2 className="size-4 animate-spin" />
              知识视频生成中…
            </div>
          </Placeholder>
        )}

      {data?.status === "FINISHED" && data.object_key && (
        <video
          controls
          className="aspect-video w-full rounded-2xl border border-[color-mix(in_oklch,var(--palette-blue-light)_30%,transparent)] bg-gradient-to-br from-palette-blue-lighter to-palette-blue-mist shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]"
          src={assetUrl(data.object_key, storage)}
        />
      )}
    </ContentCard>
  );
}

function Placeholder({
  children,
  tone = "default",
}: {
  children?: ReactNode;
  tone?: "default" | "error";
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--palette-blue-light)_30%,transparent)] bg-gradient-to-br from-palette-blue-lighter to-palette-blue-mist shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4)_0%,transparent_60%)]"
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        {tone === "default" ? (
          <Play
            className="size-24 stroke-brand-gold [filter:drop-shadow(0_4px_12px_color-mix(in_oklch,var(--brand-gold)_30%,transparent))]"
            strokeWidth={1.5}
            fill="none"
          />
        ) : (
          <p className="text-sm font-semibold text-destructive">{children}</p>
        )}
        {tone === "default" && children}
      </div>
    </div>
  );
}
