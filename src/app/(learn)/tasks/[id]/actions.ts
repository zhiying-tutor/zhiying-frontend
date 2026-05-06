"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  createInteractiveHtmlResponseSchema,
  createKnowledgeVideoResponseSchema,
  type CreateInteractiveHtmlResponse,
  type CreateKnowledgeVideoResponse,
} from "@/lib/api/schemas";

export type CreateKnowledgeVideoActionResult =
  | { ok: true; data: CreateKnowledgeVideoResponse }
  | { ok: false; message: string };

export type CreateInteractiveHtmlActionResult =
  | { ok: true; data: CreateInteractiveHtmlResponse }
  | { ok: false; message: string };

export type CompleteTaskActionResult =
  | { ok: true }
  | { ok: false; message: string };

function validatePrompt(prompt: string): string | null {
  const trimmed = prompt.trim();
  if (trimmed.length < 1) return "请填写生成提示词";
  if (trimmed.length > 2000) return "提示词不可超过 2000 字";
  return null;
}

export async function createKnowledgeVideoAction(
  taskId: number,
  prompt: string,
): Promise<CreateKnowledgeVideoActionResult> {
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return { ok: false, message: "无效的任务" };
  }
  const trimmed = prompt.trim();
  const err = validatePrompt(trimmed);
  if (err) return { ok: false, message: err };

  try {
    const data = await serverFetch<CreateKnowledgeVideoResponse>(
      `/study-tasks/${taskId}/knowledge-video`,
      {
        method: "POST",
        body: { prompt: trimmed },
        schema: createKnowledgeVideoResponseSchema,
      },
    );
    revalidatePath(`/tasks/${taskId}`);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message };
    }
    throw e;
  }
}

export async function createInteractiveHtmlAction(
  taskId: number,
  prompt: string,
): Promise<CreateInteractiveHtmlActionResult> {
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return { ok: false, message: "无效的任务" };
  }
  const trimmed = prompt.trim();
  const err = validatePrompt(trimmed);
  if (err) return { ok: false, message: err };

  try {
    const data = await serverFetch<CreateInteractiveHtmlResponse>(
      `/study-tasks/${taskId}/interactive-html`,
      {
        method: "POST",
        body: { prompt: trimmed },
        schema: createInteractiveHtmlResponseSchema,
      },
    );
    revalidatePath(`/tasks/${taskId}`);
    return { ok: true, data };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message };
    }
    throw e;
  }
}

export async function completeTaskAction(
  taskId: number,
): Promise<CompleteTaskActionResult> {
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return { ok: false, message: "无效的任务" };
  }
  try {
    await serverFetch(`/study-tasks/${taskId}/complete`, {
      method: "POST",
      body: {},
    });
    revalidatePath(`/tasks/${taskId}`);
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message };
    }
    throw e;
  }
}
