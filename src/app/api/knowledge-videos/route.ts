import { NextResponse } from "next/server";
import { z } from "zod";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { knowledgeVideoSchema, type KnowledgeVideo } from "@/lib/api/schemas";

const listSchema = z.array(knowledgeVideoSchema);

export async function GET() {
  try {
    const data = await serverFetch<KnowledgeVideo[]>("/knowledge-videos", {
      schema: listSchema,
    });
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

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  try {
    const data = await serverFetch<KnowledgeVideo>("/knowledge-videos", {
      method: "POST",
      body: body as Record<string, unknown>,
      schema: knowledgeVideoSchema,
    });
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
