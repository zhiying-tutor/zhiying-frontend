import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { interactiveHtmlSchema, type InteractiveHtml } from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/study-tasks/[id]/interactive-html">,
) {
  const { id } = await ctx.params;
  const taskId = Number(id);
  if (!Number.isInteger(taskId) || taskId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<InteractiveHtml>(
      `/study-tasks/${taskId}/interactive-html`,
      { schema: interactiveHtmlSchema },
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
