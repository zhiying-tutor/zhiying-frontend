import { Coins, Gem, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const KIND = {
  gold: { icon: Coins, className: "text-amber-600" },
  diamond: { icon: Gem, className: "text-sky-600" },
  exp: { icon: Sparkles, className: "text-brand-gold" },
} as const;

export function CurrencyBadge({
  kind,
  value,
}: {
  kind: keyof typeof KIND;
  value: number;
}) {
  const { icon: Icon, className } = KIND[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-sm tabular-nums">
      <Icon className={cn("size-4", className)} />
      {value.toLocaleString()}
    </span>
  );
}
