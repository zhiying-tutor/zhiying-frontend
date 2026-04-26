"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { AUTH_COOKIE, serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  checkinResponseSchema,
  meProfileSchema,
  studyLanguage,
  studySubjectSchema,
  userSchema,
  type CheckinResponse,
  type MeProfile,
  type StudyLanguage,
  type StudySubject,
  type User,
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

// ── Profile update ──

export type UpdateProfileInput = {
  birth_year?: number | null;
  gender?: "MALE" | "FEMALE" | null;
  introduction?: string;
};

export type UpdateProfileActionResult =
  | { ok: true; data: MeProfile }
  | { ok: false; message: string };

export async function updateProfileAction(
  input: UpdateProfileInput,
): Promise<UpdateProfileActionResult> {
  try {
    const data = await serverFetch<MeProfile>("/me", {
      method: "PATCH",
      body: input,
      schema: meProfileSchema,
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

// ── Username update ──

export type UpdateUsernameActionResult =
  | { ok: true; data: User }
  | { ok: false; message: string };

export async function updateUsernameAction(
  username: string,
): Promise<UpdateUsernameActionResult> {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 32) {
    return { ok: false, message: "昵称需在 3–32 字符内" };
  }
  try {
    const data = await serverFetch<User>("/me/username", {
      method: "PATCH",
      body: { username: trimmed },
      schema: userSchema,
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

// ── Logout ──

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/login");
}

