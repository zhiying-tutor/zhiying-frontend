import { Clapperboard, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { serverFetch } from "@/lib/api/client";
import { getPublicConfig } from "@/lib/api/public-config";
import { knowledgeVideoSchema, type KnowledgeVideo } from "@/lib/api/schemas";
import { getSession } from "@/lib/auth/session";

import { createK2VAction, deleteK2VAction } from "./actions";

const listSchema = z.array(knowledgeVideoSchema);

export default async function K2VPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [list, config] = await Promise.all([
    serverFetch<KnowledgeVideo[]>("/knowledge-videos", { schema: listSchema }),
    getPublicConfig(),
  ]);

  return (
    <ToolPageShell
      title="K2V · 知识点视频"
      subtitle="把抽象概念转成生动的解说视频，AI 自动构建分镜、合成语音、渲染输出。"
      badge={{ icon: <Clapperboard className="size-4" />, label: "知识点视频" }}
    >
      <ToolPageClient<KnowledgeVideo>
        initialList={list}
        listEndpoint="/api/knowledge-videos"
        createAction={createK2VAction}
        deleteAction={deleteK2VAction}
        dialogTitle="生成新的 K2V"
        dialogDescription="AI 将根据提示词为你生成一段知识点讲解视频"
        dialogMode={{
          kind: "single",
          placeholder:
            "例如：用生动的比喻讲解什么是 Python 的闭包函数，并附带简单代码案例。",
        }}
        currency="diamond"
        cost={config.resource.knowledge_video_diamond_cost}
        cardThemeAccent="yellow"
        cardThumbnailIcon={<Sparkles strokeWidth={2} />}
        detailKind="knowledge-video"
        emptyHint="还没有创建过任何 K2V 视频。给 AI 一个知识点，让它给你拍一支讲解短片。"
        primaryCtaLabel="开始生成"
      />
    </ToolPageShell>
  );
}
