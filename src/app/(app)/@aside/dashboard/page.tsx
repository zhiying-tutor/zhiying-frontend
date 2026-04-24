import { BookImage } from "lucide-react";

import { AiChatPanel } from "@/components/panels/ai-chat-panel";
import { CheckinButton } from "@/components/dashboard/checkin-button";
import { serverFetch } from "@/lib/api/client";
import { userSchema, type User } from "@/lib/api/schemas";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function levelFromExp(exp: number) {
  return Math.floor(Math.sqrt(exp / 100));
}

export default async function DashboardAside() {
  const user = await serverFetch<User>("/me", { schema: userSchema });
  const level = levelFromExp(user.exp);
  const today = todayIso();
  const checkedToday = user.last_checkin === today;

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex shrink-0 flex-col items-center border-b border-dashed border-border/30 px-6 pt-8 pb-6">
        <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-br from-palette-yellow-light/30 to-palette-orange-light/30" />

        <div
          className="relative z-10 mb-4 flex size-[84px] items-center justify-center rounded-[28px] bg-canvas shadow-[0_8px_16px_rgba(0,0,0,0.1)]"
          aria-label="avatar"
        >
          <div className="flex size-[60px] items-center justify-center overflow-hidden rounded-[18px] bg-palette-yellow-light text-3xl">
            🧑‍🎓
          </div>
        </div>

        <h4 className="relative z-10 mb-1 text-[19px] font-extrabold tracking-tight text-brand-dark">
          {user.username}
        </h4>
        <p className="relative z-10 mb-6 text-sm font-semibold text-brand-medium">
          初学乍练 · 累计签到{" "}
          <strong className="font-extrabold">{user.total_checkin}</strong> 天
        </p>

        <div className="relative z-10 mb-3 grid w-full grid-cols-2 gap-2">
          <StatCard label="等级" value={`Lv.${level}`} tone="yellow" />
          <StatCard
            label="连续登录"
            value={`${user.streak_checkin} 天`}
            tone="orange"
          />
          <StatCard label="🪙 金币" value={user.gold} tone="blue" />
          <StatCard label="💎 钻石" value={user.diamond} tone="purple" />
        </div>

        <div className="relative z-10 w-full">
          <CheckinButton alreadyCheckedToday={checkedToday} />
        </div>
      </div>

      <div className="shrink-0 border-b border-dashed border-border/30 px-6 py-4">
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-3 rounded-2xl bg-palette-purple-mist/60 px-4 py-3 text-left text-sm font-semibold text-brand-dark shadow-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          <BookImage className="size-5 text-palette-purple" />
          <span className="flex-1">新手图鉴</span>
          <span className="text-xs text-brand-medium">即将开放 ›</span>
        </button>
      </div>

      <AiChatPanel />
    </div>
  );
}

type Tone = "yellow" | "orange" | "blue" | "purple";

const TONE_CLASS: Record<Tone, string> = {
  yellow:
    "bg-gradient-to-br from-palette-yellow-mist to-palette-yellow-light border-palette-yellow/40 shadow-[0_2px_8px_color-mix(in_oklch,var(--palette-yellow)_25%,transparent)]",
  orange:
    "bg-gradient-to-br from-palette-orange-mist to-palette-orange-lighter border-palette-orange-light/40 shadow-[0_2px_8px_color-mix(in_oklch,var(--palette-orange-light)_25%,transparent)]",
  blue: "bg-gradient-to-br from-palette-blue-mist to-palette-blue-lighter border-palette-blue-light/20 shadow-[0_2px_8px_color-mix(in_oklch,var(--palette-blue-light)_25%,transparent)]",
  purple:
    "bg-gradient-to-br from-palette-purple-mist to-palette-purple-lighter border-palette-purple/20 shadow-[0_2px_8px_color-mix(in_oklch,var(--palette-purple)_25%,transparent)]",
};

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: Tone;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${TONE_CLASS[tone]}`}
    >
      <span className="text-xs font-bold text-brand-dark">{label}</span>
      <span className="text-base font-black text-brand-dark">{value}</span>
    </div>
  );
}
