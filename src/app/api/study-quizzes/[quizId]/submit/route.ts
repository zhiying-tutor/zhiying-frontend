import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  submitStudyQuizResponseSchema,
  type SubmitStudyQuizResponse,
} from "@/lib/api/schemas";

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/study-quizzes/[quizId]/submit">,
) {
  const { quizId } = await ctx.params;
  const id = Number(quizId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<SubmitStudyQuizResponse>(
      `/study-quizzes/${id}/submit`,
      {
        method: "POST",
        body: {},
        schema: submitStudyQuizResponseSchema,
      },
    );
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { message: err.message, code: err.code },
        { status: err.status },
      );
    }
    throw err;
  }
}
