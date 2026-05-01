import { NextResponse } from "next/server";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import {
  studyStageListSchema,
  type StudyStageDetail,
} from "@/lib/api/schemas";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/study-subjects/[id]/stages">,
) {
  const { id } = await ctx.params;
  const subjectId = Number(id);
  if (!Number.isInteger(subjectId) || subjectId <= 0) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  try {
    const data = await serverFetch<StudyStageDetail[]>(
      `/study-subjects/${subjectId}/stages`,
      { schema: studyStageListSchema },
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
