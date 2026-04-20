import Link from "next/link";
import { BookOpenText, Home, Settings, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "主页", icon: Home },
  { href: "/subjects", label: "学习", icon: Sparkles },
  { href: "/mistakes", label: "错题本", icon: BookOpenText },
  { href: "/settings", label: "设置", icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 flex-col gap-1 border-r border-border bg-sidebar px-3 py-6 md:flex",
        className,
      )}
    >
      <div className="px-3 pb-4 text-lg font-semibold text-sidebar-foreground">
        智映通学
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
