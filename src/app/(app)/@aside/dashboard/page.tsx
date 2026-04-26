import { serverFetch } from "@/lib/api/client";
import { userSchema, type User } from "@/lib/api/schemas";

import { DashboardAsideClient } from "./client";

export default async function DashboardAside() {
  const user = await serverFetch<User>("/me", { schema: userSchema });
  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = user.last_checkin === today;

  return <DashboardAsideClient user={user} checkedToday={checkedToday} />;
}
