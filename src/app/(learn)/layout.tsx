import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSession } from "@/lib/auth/session";
import { QueryProvider } from "@/lib/query/provider";

export default async function LearnLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <QueryProvider>
      <div className="min-h-dvh w-full bg-canvas">{children}</div>
    </QueryProvider>
  );
}
