"use server";

import { revalidatePath } from "next/cache";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { checkinResponseSchema, type CheckinResponse } from "@/lib/api/schemas";

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
