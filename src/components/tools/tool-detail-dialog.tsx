"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InteractiveHtmlViewer } from "@/components/learn/interactive-html-viewer";
import { VideoViewer } from "@/components/learn/video-viewer";

export type ToolDetailKind =
  | { kind: "knowledge-video"; id: number }
  | { kind: "code-video"; id: number }
  | { kind: "interactive-html"; id: number };

export function ToolDetailDialog({
  open,
  onOpenChange,
  prompt,
  resource,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  resource: ToolDetailKind;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-brand-dark line-clamp-2">
            {prompt.split("\n")[0]?.replace(/^#+\s*/, "") || "未命名"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {resource.kind === "knowledge-video" && (
            <VideoViewer
              source={{
                kind: "tool",
                resourceKind: "knowledge-videos",
                id: resource.id,
              }}
              showCard={false}
            />
          )}
          {resource.kind === "code-video" && (
            <VideoViewer
              source={{
                kind: "tool",
                resourceKind: "code-videos",
                id: resource.id,
              }}
              showCard={false}
            />
          )}
          {resource.kind === "interactive-html" && (
            <InteractiveHtmlViewer
              source={{ kind: "tool", id: resource.id }}
              showCard={false}
            />
          )}

          <details className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-xs text-brand-medium shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
            <summary className="cursor-pointer text-sm font-bold text-brand-dark">
              查看完整 prompt
            </summary>
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-brand-dark">
              {prompt}
            </pre>
          </details>
        </div>
      </DialogContent>
    </Dialog>
  );
}
