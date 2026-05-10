import { SearchCode, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { serverFetch } from "@/lib/api/client";
import { getPublicConfig } from "@/lib/api/public-config";
import { codeVideoSchema, type CodeVideo } from "@/lib/api/schemas";
import { getSession } from "@/lib/auth/session";

import { createC2VAction, deleteC2VAction } from "./actions";

const listSchema = z.array(codeVideoSchema);

export default async function C2VPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [list, config] = await Promise.all([
    serverFetch<CodeVideo[]>("/code-videos", { schema: listSchema }),
    getPublicConfig(),
  ]);

  return (
    <ToolPageShell
      title="C2V · 代码题解视频"
      subtitle="把题目和代码合二为一，AI 自动逐步讲解算法思路与执行过程。"
      badge={{ icon: <SearchCode className="size-4" />, label: "代码题解视频" }}
    >
      <ToolPageClient<CodeVideo>
        initialList={list}
        listEndpoint="/api/code-videos"
        createAction={createC2VAction}
        deleteAction={deleteC2VAction}
        dialogTitle="生成新的 C2V"
        dialogDescription="AI 会逐步可视化你给定的算法解法"
        dialogMode={{
          kind: "code-pair",
          problemPlaceholder:
            "粘贴题目背景、输入输出格式与约束条件…",
          codePlaceholder: "粘贴可运行的核心代码…",
        }}
        currency="diamond"
        cost={config.resource.code_video_diamond_cost}
        cardThemeAccent="orange"
        cardThumbnailIcon={<Sparkles strokeWidth={2} />}
        detailKind="code-video"
        emptyHint="还没有生成过任何 C2V 视频。给 AI 一道题和你的解法，它会做成讲解短片。"
        primaryCtaLabel="开始生成"
      />
    </ToolPageShell>
  );
}
