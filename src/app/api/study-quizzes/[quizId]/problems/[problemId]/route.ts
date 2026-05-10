import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { problemAnswer } from "@/lib/api/schemas";

export async function PATCH(
  req: Request,
  ctx: RouteContext<"/api/study-quizzes/[quizId]/problems/[problemId]">,
) {
  const { quizId, problemId } = await ctx.params;
  const qid = Number(quizId);
  const pid = Number(problemId);
  if (
    !Number.isInteger(qid) ||
    qid <= 0 ||
    !Number.isInteger(pid) ||
    pid <= 0
  ) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  const parsed = problemAnswer.safeParse(
    body && typeof body === "object" && "chosen_answer" in body
      ? (body as { chosen_answer: unknown }).chosen_answer
      : undefined,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: "无效的答案选项" },
      { status: 400 },
    );
  }

  try {
    await serverFetch(`/study-quizzes/${qid}/problems/${pid}`, {
      method: "PATCH",
      body: { chosen_answer: parsed.data },
    });
    return NextResponse.json({ data: { ok: true } });
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
