"use client";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  FilePen,
  Search,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  bookmarksQueryKey,
  mistakesQueryKey,
  useBookmarks,
  useMistakes,
} from "@/lib/query/mistakes";
import { requestJson } from "@/lib/query/utils";
import type { QuizProblemReview } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

type Mode = "mistakes" | "bookmarks";

export function MistakesClient() {
  const [mode, setMode] = useState<Mode>("mistakes");
  const [includeHidden, setIncludeHidden] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const mistakesQuery = useMistakes(includeHidden);
  const bookmarksQuery = useBookmarks();

  const items =
    mode === "mistakes"
      ? (mistakesQuery.data ?? [])
      : (bookmarksQuery.data ?? []);
  const isLoading =
    mode === "mistakes" ? mistakesQuery.isLoading : bookmarksQuery.isLoading;

  // 切 Tab 时清空详情
  useEffect(() => {
    setActiveId(null);
  }, [mode]);

  const activeIndex = useMemo(
    () => items.findIndex((it) => it.id === activeId),
    [items, activeId],
  );
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  return (
    <div className="min-h-dvh w-full bg-canvas">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-10 py-10 lg:px-16">
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/40 bg-white/70 px-4 py-2 text-sm font-bold text-brand-dark shadow-[0_2px_6px_rgba(0,0,0,0.04)] backdrop-blur-md transition-all duration-200 hover:-translate-y-px hover:bg-white/95"
        >
          <ArrowLeft className="size-4" />
          返回主页面
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="bg-gradient-to-br from-brand-dark to-palette-orange bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">
            错题本 / 收藏夹
            <span className="ml-1 animate-pulse font-normal text-palette-orange [text-shadow:0_0_10px_color-mix(in_oklch,var(--palette-orange)_50%,transparent)]">
              |
            </span>
          </h1>
          <p className="text-base font-medium text-brand-medium">
            智能收集错题与收藏题目，精准定位薄弱环节
          </p>
        </header>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="bg-palette-yellow-mist/80 p-1.5 shadow-[inset_0_1px_2px_color-mix(in_oklch,var(--palette-orange)_15%,transparent)]">
            <TabsTrigger
              value="mistakes"
              className="gap-2 px-6 text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-palette-yellow-light data-[state=active]:to-palette-orange-light data-[state=active]:text-brand-dark data-[state=active]:shadow-[0_2px_6px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)]"
            >
              <FilePen className="size-4" />
              错题本
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="gap-2 px-6 text-sm font-bold data-[state=active]:bg-gradient-to-br data-[state=active]:from-palette-yellow-light data-[state=active]:to-palette-orange-light data-[state=active]:text-brand-dark data-[state=active]:shadow-[0_2px_6px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)]"
            >
              <Star className="size-4" />
              收藏夹
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mistakes" className="mt-6 flex flex-col gap-6">
            <SearchPlaceholder />
            <CountBar count={items.length} mode="mistakes">
              <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-medium shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <Checkbox
                  checked={includeHidden}
                  onCheckedChange={(v) => setIncludeHidden(v === true)}
                />
                显示已隐藏错题
              </label>
            </CountBar>
            <CardGrid
              items={items}
              isLoading={isLoading}
              mode="mistakes"
              onOpen={setActiveId}
              emptyHint="还没有错题，先去做几次小测吧"
            />
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6 flex flex-col gap-6">
            <SearchPlaceholder />
            <CountBar count={items.length} mode="bookmarks" />
            <CardGrid
              items={items}
              isLoading={isLoading}
              mode="bookmarks"
              onOpen={setActiveId}
              emptyHint="还没有收藏题目，做小测时点击星标即可"
            />
          </TabsContent>
        </Tabs>
      </div>

      <DetailDialog
        item={activeItem}
        index={activeIndex}
        total={items.length}
        onClose={() => setActiveId(null)}
        onPrev={() =>
          activeIndex > 0 && setActiveId(items[activeIndex - 1].id)
        }
        onNext={() =>
          activeIndex >= 0 &&
          activeIndex < items.length - 1 &&
          setActiveId(items[activeIndex + 1].id)
        }
      />
    </div>
  );
}

function SearchPlaceholder() {
  return (
    <div className="flex h-12 cursor-not-allowed items-center gap-3 rounded-2xl border border-palette-yellow-light/80 bg-white/80 px-5 text-sm text-brand-light shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
      <Search className="size-4" />
      <span className="font-medium">搜索题目…（即将上线）</span>
    </div>
  );
}

function CountBar({
  count,
  mode,
  children,
}: {
  count: number;
  mode: Mode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-palette-yellow-light/60 to-palette-orange-lighter/40 px-4 py-1.5 text-sm font-bold text-brand-dark shadow-[0_2px_6px_color-mix(in_oklch,var(--palette-orange-light)_25%,transparent)]">
        {mode === "mistakes" ? (
          <FilePen className="size-3.5" />
        ) : (
          <Star className="size-3.5" />
        )}
        共 <strong className="font-extrabold">{count}</strong> 题
      </span>
      {children}
    </div>
  );
}

function CardGrid({
  items,
  isLoading,
  mode,
  onOpen,
  emptyHint,
}: {
  items: QuizProblemReview[];
  isLoading: boolean;
  mode: Mode;
  onOpen: (id: number) => void;
  emptyHint: string;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-2xl border border-border/30 bg-white/60"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border/30 bg-white/40 px-8 py-16 text-center">
        <div className="text-4xl">🌱</div>
        <p className="text-sm font-bold text-brand-dark">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <Card key={it.id} item={it} mode={mode} onOpen={onOpen} />
      ))}
    </div>
  );
}

function Card({
  item,
  mode,
  onOpen,
}: {
  item: QuizProblemReview;
  mode: Mode;
  onOpen: (id: number) => void;
}) {
  const qc = useQueryClient();

  const toggleHide = useMutation({
    mutationFn: async () => {
      await requestJson(
        `/api/quiz-problems/${item.id}/mistake-visibility`,
        { method: "PATCH" },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "mistakes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      await requestJson(`/api/quiz-problems/${item.id}/bookmark`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookmarksQueryKey() });
      qc.invalidateQueries({ queryKey: mistakesQueryKey(true) });
      qc.invalidateQueries({ queryKey: mistakesQueryKey(false) });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dimmed = mode === "mistakes" && item.mistake_hidden;

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={cn(
        "group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/30 bg-white/90 p-5 text-left shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]",
        dimmed && "opacity-55",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1.5",
          mode === "mistakes"
            ? "bg-gradient-to-r from-destructive/80 to-palette-orange/60"
            : "bg-gradient-to-r from-palette-yellow to-palette-orange",
        )}
      />

      <div className="flex items-start justify-between gap-3 pt-1.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl text-base shadow-[0_2px_6px_rgba(0,0,0,0.06)]",
            mode === "mistakes"
              ? "bg-danger-surface text-destructive"
              : "bg-palette-yellow-light text-palette-orange",
          )}
        >
          {mode === "mistakes" ? (
            <X className="size-4.5" strokeWidth={2.5} />
          ) : (
            <Star className="size-4.5 fill-current" />
          )}
        </div>
      </div>

      <p className="line-clamp-2 text-sm font-bold text-brand-dark">
        {item.content}
      </p>

      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-brand-light">
        <span className="rounded-full bg-palette-purple-mist px-2 py-0.5 text-palette-purple">
          {item.source.subject_name}
        </span>
        <span className="rounded-full bg-palette-blue-mist px-2 py-0.5 text-palette-blue">
          {item.source.stage_title}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-dashed border-border/30 pt-3 text-[11px] text-brand-light">
        <span>🕐 {formatTime(item.created_at)}</span>
        {mode === "mistakes" ? (
          <span
            role="button"
            aria-label={item.mistake_hidden ? "取消隐藏" : "隐藏错题"}
            onClick={(e) => {
              e.stopPropagation();
              toggleHide.mutate();
            }}
            className="flex size-7 items-center justify-center rounded-full bg-white text-brand-medium opacity-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition group-hover:opacity-100 hover:text-palette-orange"
          >
            {item.mistake_hidden ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </span>
        ) : (
          <span
            role="button"
            aria-label="取消收藏"
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark.mutate();
            }}
            className="flex size-7 items-center justify-center rounded-full bg-white text-palette-orange opacity-0 shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition group-hover:opacity-100 hover:bg-palette-yellow-light"
          >
            <Star className="size-3.5 fill-current" />
          </span>
        )}
      </div>
    </button>
  );
}

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function DetailDialog({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  item: QuizProblemReview | null;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const open = item !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[640px] overflow-hidden border-0 bg-white p-0"
      >
        <DialogTitle className="sr-only">题目详情</DialogTitle>
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-palette-yellow via-palette-orange to-palette-blue"
        />

        {item && (
          <div className="flex flex-col gap-5 px-7 py-7">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 rounded-full bg-palette-yellow-mist px-2.5 py-1 text-sm">
                <button
                  type="button"
                  disabled={index <= 0}
                  onClick={onPrev}
                  className="flex size-6 items-center justify-center rounded-full text-brand-dark transition disabled:opacity-40 hover:bg-white/80"
                  aria-label="上一题"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="font-bold text-brand-dark">
                  {index + 1} / {total}
                </span>
                <button
                  type="button"
                  disabled={index >= total - 1}
                  onClick={onNext}
                  className="flex size-6 items-center justify-center rounded-full text-brand-dark transition disabled:opacity-40 hover:bg-white/80"
                  aria-label="下一题"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex size-8 items-center justify-center rounded-full bg-palette-yellow-mist/60 text-brand-medium transition hover:bg-palette-yellow-light"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="rounded-full bg-palette-purple-mist px-2.5 py-0.5 font-semibold text-palette-purple">
                {item.source.subject_name}
              </span>
              <span className="rounded-full bg-palette-blue-mist px-2.5 py-0.5 font-semibold text-palette-blue">
                {item.source.stage_title}
              </span>
              <span className="rounded-full bg-palette-orange-mist px-2.5 py-0.5 font-semibold text-palette-orange">
                {item.source.task_title}
              </span>
            </div>

            <p
              className="text-base font-bold text-brand-dark"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {item.content}
            </p>

            <div className="flex flex-col gap-2.5">
              {OPTION_LETTERS.map((letter) => {
                const text =
                  item[
                    `choice_${letter.toLowerCase()}` as
                      | "choice_a"
                      | "choice_b"
                      | "choice_c"
                      | "choice_d"
                  ];
                const isCorrect = item.answer === letter;
                const isChosen = item.chosen_answer === letter;

                let stateClass = "border-border/30 bg-white";
                let badge: { label: string; className: string } | null = null;

                if (isCorrect) {
                  stateClass =
                    "border-palette-green/60 bg-palette-green-lighter/40";
                  badge = {
                    label: "✓ 正确答案",
                    className: "bg-palette-green-lighter text-palette-green",
                  };
                }
                if (isChosen && !isCorrect) {
                  stateClass = "border-destructive bg-danger-surface/40";
                  badge = {
                    label: "× 你的选择",
                    className: "bg-danger-surface text-destructive",
                  };
                }

                return (
                  <div
                    key={letter}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-sm",
                      stateClass,
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                        isCorrect
                          ? "bg-palette-green text-white"
                          : isChosen
                            ? "bg-destructive text-white"
                            : "bg-palette-yellow-light/70 text-brand-medium",
                      )}
                    >
                      {letter}
                    </span>
                    <span
                      className="flex-1 leading-relaxed text-brand-dark"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {text}
                    </span>
                    {badge ? (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {item.explanation ? (
              <div className="rounded-2xl bg-palette-yellow-mist/60 p-4 text-sm leading-relaxed text-brand-dark">
                <div className="mb-1 text-xs font-bold text-brand-medium">
                  💡 解析
                </div>
                <p style={{ whiteSpace: "pre-wrap" }}>{item.explanation}</p>
              </div>
            ) : null}

            <div className="flex items-center justify-between text-xs text-brand-light">
              <span>🕐 {formatTime(item.created_at)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
