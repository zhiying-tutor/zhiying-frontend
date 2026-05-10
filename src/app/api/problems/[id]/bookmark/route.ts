import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export async function PATCH(
  _req: Request,
  ctx: RouteContext<"/api/problems/[id]/bookmark">,
) {
  const { id } = await ctx.params;
  const problemId = Number(id);
  if (!Number.isInteger(problemId) || problemId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    await serverFetch(`/problems/${problemId}/bookmark`, {
      method: "PATCH",
      body: {},
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
