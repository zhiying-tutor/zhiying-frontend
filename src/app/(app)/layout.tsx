import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getSession } from "@/lib/auth/session";

export default async function AppLayout({
  children,
  aside,
}: {
  children: ReactNode;
  aside: ReactNode;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const hasAside = aside !== null && aside !== undefined;

  return (
    <div className="flex h-dvh w-full bg-canvas">
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
      {hasAside ? (
        <aside className="hidden w-[clamp(320px,30vw,450px)] shrink-0 flex-col overflow-y-auto border-l border-border/40 bg-gradient-to-b from-palette-orange-mist/60 to-canvas lg:flex">
          {aside}
        </aside>
      ) : null}
    </div>
  );
}
