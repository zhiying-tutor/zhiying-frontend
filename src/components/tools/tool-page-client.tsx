"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ToolCard } from "@/components/tools/tool-card";
import { ToolCreateDialog } from "@/components/tools/tool-create-dialog";
import {
  ToolDetailDialog,
  type ToolDetailKind,
} from "@/components/tools/tool-detail-dialog";
import { Button } from "@/components/ui/button";
import { meQueryKey } from "@/lib/query/keys";
import { useMe } from "@/lib/query/me";
import { getJson } from "@/lib/query/utils";

import type { ReactNode } from "react";

type ResourceStatus = "QUEUING" | "GENERATING" | "FINISHED" | "FAILED";

export interface ToolResource {
  id: number;
  status: ResourceStatus;
  prompt: string;
  object_key: string | null;
  created_at: number;
}

export interface ToolPageClientProps<T extends ToolResource> {
  // 列表
  initialList: T[];
  listEndpoint: string;
  // 创建/删除
  createAction: (
    prompt: string,
  ) => Promise<{ ok: true; data: T } | { ok: false; message: string }>;
  deleteAction: (
    id: number,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  // 创建对话框
  dialogTitle: string;
  dialogDescription: string;
  dialogMode:
    | { kind: "single"; placeholder: string; defaultValue?: string }
    | { kind: "code-pair"; problemPlaceholder: string; codePlaceholder: string };
  // 消费
  currency: "diamond" | "gold";
  cost: number;
  // 卡片
  cardThemeAccent: "yellow" | "orange" | "blue";
  cardThumbnailIcon: ReactNode;
  detailKind: "knowledge-video" | "code-video" | "interactive-html";
  // 文案
  emptyHint: string;
  primaryCtaLabel: string;
}

export function ToolPageClient<T extends ToolResource>({
  initialList,
  listEndpoint,
  createAction,
  deleteAction,
  dialogTitle,
  dialogDescription,
  dialogMode,
  currency,
  cost,
  cardThemeAccent,
  cardThumbnailIcon,
  detailKind,
  emptyHint,
  primaryCtaLabel,
}: ToolPageClientProps<T>) {
  const me = useMe();
  const balance = me ? (currency === "diamond" ? me.diamond : me.gold) : 0;
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<{ id: number; prompt: string } | null>(
    null,
  );
  const [, startTransition] = useTransition();
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: list = initialList } = useQuery<T[]>({
    queryKey: ["tool-list", listEndpoint] as const,
    queryFn: async () => (await getJson(listEndpoint)) as T[],
    initialData: initialList,
    refetchInterval: (query) => {
      const items = query.state.data;
      if (!items) return 2000;
      const inflight = items.some(
        (it) => it.status === "QUEUING" || it.status === "GENERATING",
      );
      return inflight ? 2000 : false;
    },
    staleTime: 0,
  });

  const handleCreateSuccess = () => {
    qc.invalidateQueries({ queryKey: ["tool-list", listEndpoint] });
    qc.invalidateQueries({ queryKey: meQueryKey });
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    startTransition(async () => {
      const result = await deleteAction(id);
      setPendingDeleteId(null);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("已从工具画廊移除");
      qc.invalidateQueries({ queryKey: ["tool-list", listEndpoint] });
    });
  };

  const detailResource: ToolDetailKind | null = detail
    ? { kind: detailKind, id: detail.id }
    : null;

  return (
    <>
      <section className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur sm:p-8">
        <h2 className="text-xl font-extrabold text-brand-dark">创建新作品</h2>
        <p className="text-sm leading-relaxed text-brand-medium">
          {emptyHint}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-br from-palette-yellow to-palette-orange font-bold text-brand-dark shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)] hover:opacity-90"
          >
            🚀 {primaryCtaLabel}
          </Button>
          <span className="text-xs font-semibold text-brand-medium">
            每次消耗 {cost} {currency === "diamond" ? "钻石" : "金币"} · 当前余额{" "}
            {balance}
          </span>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-brand-dark">
            我的作品
            <span className="ml-2 rounded-full bg-palette-orange-lighter px-2.5 py-0.5 text-xs font-bold text-palette-orange">
              {list.length}
            </span>
          </h2>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-border/30 bg-white/50 px-8 py-16 text-center">
            <div className="text-5xl">📦</div>
            <p className="max-w-md text-sm font-medium text-brand-medium">
              {emptyHint}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
            {list.map((item) => (
              <ToolCard
                key={item.id}
                title={titleFromPrompt(item.prompt)}
                status={item.status}
                createdAt={item.created_at}
                thumbnailIcon={cardThumbnailIcon}
                themeAccent={cardThemeAccent}
                onClick={() => setDetail({ id: item.id, prompt: item.prompt })}
                onDelete={() => handleDelete(item.id)}
                deleting={pendingDeleteId === item.id}
              />
            ))}
          </div>
        )}
      </section>

      <ToolCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title={dialogTitle}
        description={dialogDescription}
        mode={dialogMode}
        currency={currency}
        cost={cost}
        currentBalance={balance}
        onSubmit={async (prompt) => {
          const result = await createAction(prompt);
          if (!result.ok) return result;
          return { ok: true, id: result.data.id };
        }}
        onSuccess={handleCreateSuccess}
      />

      {detail && detailResource ? (
        <ToolDetailDialog
          open={detail !== null}
          onOpenChange={(o) => {
            if (!o) setDetail(null);
          }}
          prompt={detail.prompt}
          resource={detailResource}
        />
      ) : null}
    </>
  );
}

function titleFromPrompt(prompt: string): string {
  const firstLine = prompt.split("\n").find((l) => l.trim().length > 0);
  if (!firstLine) return "未命名";
  const cleaned = firstLine.replace(/^#+\s*/, "").trim();
  return cleaned.length > 60 ? cleaned.slice(0, 60) + "…" : cleaned;
}
