import { SystemOwnerDashboard } from "@/components/system-owner/system-owner-dashboard";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  const role = JSON.parse(user!).role;

  if (role === "system_owner") {
    return <SystemOwnerDashboard />;
  }
  return <div>Dashboard</div>;
}
