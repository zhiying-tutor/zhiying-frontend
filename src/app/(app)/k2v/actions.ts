"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  knowledgeVideoSchema,
  type KnowledgeVideo,
} from "@/lib/api/schemas";

export type CreateK2VActionResult =
  | { ok: true; data: KnowledgeVideo }
  | { ok: false; message: string };

export type DeleteToolResourceActionResult =
  | { ok: true }
  | { ok: false; message: string };

function validatePrompt(prompt: string): string | null {
  const trimmed = prompt.trim();
  if (trimmed.length < 1) return "请填写生成提示词";
  if (trimmed.length > 4000) return "提示词不可超过 4000 字";
  return null;
}

export async function createK2VAction(
  prompt: string,
): Promise<CreateK2VActionResult> {
  const err = validatePrompt(prompt);
  if (err) return { ok: false, message: err };

  try {
    const data = await serverFetch<KnowledgeVideo>("/knowledge-videos", {
      method: "POST",
      body: { prompt: prompt.trim() },
      schema: knowledgeVideoSchema,
    });
    revalidatePath("/k2v");
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    return { ok: false, message: "创建失败，请稍后重试" };
  }
}

export async function deleteK2VAction(
  id: number,
): Promise<DeleteToolResourceActionResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "无效的资源" };
  }
  try {
    await serverFetch(`/knowledge-videos/${id}`, { method: "DELETE" });
    revalidatePath("/k2v");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    return { ok: false, message: "删除失败，请稍后重试" };
  }
}
