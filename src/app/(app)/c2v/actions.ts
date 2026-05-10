"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { codeVideoSchema, type CodeVideo } from "@/lib/api/schemas";

export type CreateC2VActionResult =
  | { ok: true; data: CodeVideo }
  | { ok: false; message: string };

export type DeleteToolResourceActionResult =
  | { ok: true }
  | { ok: false; message: string };

function validatePrompt(prompt: string): string | null {
  const trimmed = prompt.trim();
  if (trimmed.length < 1) return "请填写生成提示词";
  if (trimmed.length > 8000) return "提示词不可超过 8000 字";
  return null;
}

export async function createC2VAction(
  prompt: string,
): Promise<CreateC2VActionResult> {
  const err = validatePrompt(prompt);
  if (err) return { ok: false, message: err };

  try {
    const data = await serverFetch<CodeVideo>("/code-videos", {
      method: "POST",
      body: { prompt: prompt.trim() },
      schema: codeVideoSchema,
    });
    revalidatePath("/c2v");
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    return { ok: false, message: "创建失败，请稍后重试" };
  }
}

export async function deleteC2VAction(
  id: number,
): Promise<DeleteToolResourceActionResult> {
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, message: "无效的资源" };
  }
  try {
    await serverFetch(`/code-videos/${id}`, { method: "DELETE" });
    revalidatePath("/c2v");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, message: e.message };
    return { ok: false, message: "删除失败，请稍后重试" };
  }
}
