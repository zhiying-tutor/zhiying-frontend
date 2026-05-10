import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export async function PATCH(
  _req: Request,
  ctx: RouteContext<"/api/quiz-problems/[id]/mistake-visibility">,
) {
  const { id } = await ctx.params;
  const quizProblemId = Number(id);
  if (!Number.isInteger(quizProblemId) || quizProblemId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch(
      `/quiz-problems/${quizProblemId}/mistake-visibility`,
      {
        method: "PATCH",
        body: {},
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
