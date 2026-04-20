import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CurrencyBadge } from "@/components/app-shell/currency-badge";
import type { User } from "@/lib/api/schemas";

export function TopBar({ user }: { user: User }) {
  const initial = user.username.slice(0, 1).toUpperCase();
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="text-sm text-muted-foreground md:hidden">智映通学</div>
      <div className="ml-auto flex items-center gap-2">
        <CurrencyBadge kind="gold" value={user.gold} />
        <CurrencyBadge kind="diamond" value={user.diamond} />
        <CurrencyBadge kind="exp" value={user.exp} />
        <Avatar className="size-8">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
