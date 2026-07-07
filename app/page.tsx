import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { displayNameFromUser } from "@/lib/user-display";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userName = displayNameFromUser(user);

  return <DashboardShell title="Dashboard" userName={userName} />;
}
