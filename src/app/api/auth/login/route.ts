import { NextResponse } from "next/server";
import { z } from "zod";

import { serverFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { tokenSchema, type Token } from "@/lib/api/schemas";
import { AUTH_COOKIE } from "@/lib/api/client";
import { AUTH_COOKIE_MAX_AGE } from "@/lib/auth/session";

const bodySchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid credentials format" }, { status: 400 });
  }

  try {
    const { token } = await serverFetch<Token>("/tokens", {
      method: "POST",
      body: parsed.data,
      schema: tokenSchema,
      skipAuth: true,
    });

    const res = NextResponse.json({ success: true }, { status: 200 });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return res;
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
