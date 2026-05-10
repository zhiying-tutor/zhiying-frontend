import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { knowledgeVideoSchema, type KnowledgeVideo } from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/knowledge-videos/[id]">,
) {
  const { id } = await ctx.params;
  const videoId = Number(id);
  if (!Number.isInteger(videoId) || videoId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<KnowledgeVideo>(
      `/knowledge-videos/${videoId}`,
      { schema: knowledgeVideoSchema },
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

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/knowledge-videos/[id]">,
) {
  const { id } = await ctx.params;
  const videoId = Number(id);
  if (!Number.isInteger(videoId) || videoId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    await serverFetch(`/knowledge-videos/${videoId}`, { method: "DELETE" });
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
