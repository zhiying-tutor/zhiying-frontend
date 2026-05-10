import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { quizProblemReviewListSchema } from "@/lib/api/schemas";

export async function GET() {
  try {
    const data = await serverFetch("/me/bookmarks", {
      schema: quizProblemReviewListSchema,
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
