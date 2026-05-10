import { Box, FlaskConical } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ToolPageShell } from "@/components/tools/tool-page-shell";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { serverFetch } from "@/lib/api/client";
import { getPublicConfig } from "@/lib/api/public-config";
import {
  interactiveHtmlSchema,
  type InteractiveHtml,
} from "@/lib/api/schemas";
import { getSession } from "@/lib/auth/session";

import { createInteractiveAction, deleteInteractiveAction } from "./actions";

const listSchema = z.array(interactiveHtmlSchema);

export default async function InteractivePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [list, config] = await Promise.all([
    serverFetch<InteractiveHtml[]>("/interactive-htmls", {
      schema: listSchema,
    }),
    getPublicConfig(),
  ]);

  return (
    <ToolPageShell
      title="交互式实验室"
      subtitle="AI 生成可交互的演示页面，让你在沙盒里动手探索算法、数据结构与可视化。"
      badge={{ icon: <FlaskConical className="size-4" />, label: "交互式实验室" }}
    >
      <ToolPageClient<InteractiveHtml>
        initialList={list}
        listEndpoint="/api/interactive-htmls"
        createAction={createInteractiveAction}
        deleteAction={deleteInteractiveAction}
        dialogTitle="生成新的交互式实验"
        dialogDescription="AI 将根据知识点输出一个可交互的 HTML 沙盒"
        dialogMode={{
          kind: "single",
          placeholder:
            "例如：可视化汉诺塔的递归调用过程，允许用户调节盘数与速度。",
        }}
        currency="gold"
        cost={config.resource.interactive_html_gold_cost}
        cardThemeAccent="blue"
        cardThumbnailIcon={<Box strokeWidth={2} />}
        detailKind="interactive-html"
        emptyHint="还没有生成过任何交互式实验。让 AI 把抽象的概念变成可玩的沙盒。"
        primaryCtaLabel="开始生成"
      />
    </ToolPageShell>
  );
}
