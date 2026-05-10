"use client";

import { Loader2, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToolCardStatus = "QUEUING" | "GENERATING" | "FINISHED" | "FAILED";

export interface ToolCardProps {
  title: string;
  status: ToolCardStatus;
  createdAt: number;
  thumbnailIcon: ReactNode;
  themeAccent: "yellow" | "orange" | "blue";
  onClick: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

const ACCENT_BG: Record<ToolCardProps["themeAccent"], string> = {
  yellow:
    "bg-gradient-to-br from-palette-yellow-lighter to-palette-yellow-mist",
  orange:
    "bg-gradient-to-br from-palette-orange-lighter to-palette-orange-mist",
  blue: "bg-gradient-to-br from-palette-blue-lighter to-palette-blue-mist",
};

const ACCENT_TEXT: Record<ToolCardProps["themeAccent"], string> = {
  yellow: "text-palette-yellow",
  orange: "text-palette-orange",
  blue: "text-palette-blue",
};

const STATUS_LABEL: Record<ToolCardStatus, string> = {
  QUEUING: "排队中",
  GENERATING: "生成中",
  FINISHED: "已就绪",
  FAILED: "失败",
};

const STATUS_BG: Record<ToolCardStatus, string> = {
  QUEUING: "bg-palette-yellow-light/80 text-palette-orange",
  GENERATING: "bg-palette-blue-mist text-palette-blue",
  FINISHED: "bg-palette-green-lighter text-palette-green",
  FAILED: "bg-destructive/10 text-destructive",
};

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

export function ToolCard({
  title,
  status,
  createdAt,
  thumbnailIcon,
  themeAccent,
  onClick,
  onDelete,
  deleting = false,
}: ToolCardProps) {
  return (
    <div
      className="group relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex aspect-video items-center justify-center overflow-hidden rounded-xl",
          ACCENT_BG[themeAccent],
        )}
      >
        <div
          className={cn(
            "[&>svg]:size-12 [filter:drop-shadow(0_4px_8px_color-mix(in_oklch,var(--brand-gold)_30%,transparent))]",
            ACCENT_TEXT[themeAccent],
          )}
        >
          {thumbnailIcon}
        </div>
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-bold",
            STATUS_BG[status],
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-extrabold text-brand-dark">
          {title}
        </h3>
        <span className="text-[11px] font-medium text-brand-light">
          {formatTime(createdAt)}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 bottom-2 size-8 rounded-full p-0 opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={deleting}
        title="从工具画廊移除"
      >
        {deleting ? (
          <Loader2 className="size-4 animate-spin text-brand-medium" />
        ) : (
          <Trash2 className="size-4 text-destructive" />
        )}
      </Button>
    </div>
  );
}
