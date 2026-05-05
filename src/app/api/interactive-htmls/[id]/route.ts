import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { interactiveHtmlSchema, type InteractiveHtml } from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/interactive-htmls/[id]">,
) {
  const { id } = await ctx.params;
  const htmlId = Number(id);
  if (!Number.isInteger(htmlId) || htmlId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<InteractiveHtml>(
      `/interactive-htmls/${htmlId}`,
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
