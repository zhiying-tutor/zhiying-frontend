"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { checkinAction } from "@/app/(app)/dashboard/actions";

export function CheckinButton({ alreadyCheckedToday }: { alreadyCheckedToday: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(alreadyCheckedToday);

  const handleClick = () => {
    startTransition(async () => {
      const result = await checkinAction();
      if (result.ok) {
        setDone(true);
        toast.success(`签到成功 +${result.data.gold_reward} 金币`, {
          description: `连续签到 ${result.data.streak_checkins} 天`,
        });
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending || done}
      onClick={handleClick}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-palette-yellow to-palette-orange text-sm font-bold text-brand-dark shadow-[0_4px_12px_color-mix(in_oklch,var(--palette-orange)_30%,transparent)] transition-transform hover:not-disabled:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {done ? "✓ 今日已签到" : isPending ? "签到中…" : "🔥 立即签到"}
    </button>
  );
}
