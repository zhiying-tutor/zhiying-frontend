"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  checkinResponseSchema,
  studyLanguage,
  studySubjectSchema,
  type CheckinResponse,
  type StudyLanguage,
  type StudySubject,
} from "@/lib/api/schemas";

export type CheckinActionResult =
  | { ok: true; data: CheckinResponse }
  | { ok: false; message: string };

export async function checkinAction(): Promise<CheckinActionResult> {
  try {
    const data = await serverFetch<CheckinResponse>("/checkins", {
      method: "POST",
      body: {},
      schema: checkinResponseSchema,
    });
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message };
    }
    throw err;
  }
}

export type CreateSubjectInput = {
  subject: string;
  language: StudyLanguage;
  total_stages: number;
  target: string;
};

export type CreateSubjectActionResult =
  | { ok: true; data: StudySubject }
  | { ok: false; message: string };

export async function createSubjectAction(
  input: CreateSubjectInput,
): Promise<CreateSubjectActionResult> {
  const subject = input.subject.trim();
  if (subject.length < 1 || subject.length > 200) {
    return { ok: false, message: "学习主题需在 1–200 字内" };
  }
  const langParse = studyLanguage.safeParse(input.language);
  if (!langParse.success) {
    return { ok: false, message: "请选择编程语言" };
  }
  if (!Number.isInteger(input.total_stages) || input.total_stages <= 0) {
    return { ok: false, message: "请选择学习阶段数" };
  }
  const target = input.target.trim();
  if (target.length > 2000) {
    return { ok: false, message: "学习目标不可超过 2000 字" };
  }

  try {
    const data = await serverFetch<StudySubject>("/study-subjects", {
      method: "POST",
      body: {
        subject,
        language: langParse.data,
        total_stages: input.total_stages,
        target,
      },
      schema: studySubjectSchema,
    });
    revalidatePath("/dashboard");
    return { ok: true, data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { ok: false, message: err.message };
    }
    throw err;
  }
}

