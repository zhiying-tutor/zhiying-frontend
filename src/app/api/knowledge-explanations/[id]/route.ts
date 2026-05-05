import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  knowledgeExplanationSchema,
  type KnowledgeExplanation,
} from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/knowledge-explanations/[id]">,
) {
  const { id } = await ctx.params;
  const explanationId = Number(id);
  if (!Number.isInteger(explanationId) || explanationId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<KnowledgeExplanation>(
      `/knowledge-explanations/${explanationId}`,
      { schema: knowledgeExplanationSchema },
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
