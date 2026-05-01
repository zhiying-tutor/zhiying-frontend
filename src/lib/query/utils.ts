"use client";

export async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { accept: "application/json" } });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : null) ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new Error("Malformed response: missing data envelope");
  }
  return (payload as { data: unknown }).data;
}
