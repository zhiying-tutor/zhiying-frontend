import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  studyQuizDetailSchema,
  type StudyQuizDetail,
} from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/study-quizzes/[quizId]">,
) {
  const { quizId } = await ctx.params;
  const id = Number(quizId);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<StudyQuizDetail>(
      `/study-quizzes/${id}`,
      { schema: studyQuizDetailSchema },
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
