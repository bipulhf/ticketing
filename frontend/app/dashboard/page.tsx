import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { ItPersonDashboard } from "@/components/it-person/it-person-dashboard";
import { SuperAdminDashboard } from "@/components/super-admin/super-admin-dashboard";
import { SystemOwnerDashboard } from "@/components/system-owner/system-owner-dashboard";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  const role = JSON.parse(user!).role;

  if (role === "system_owner") {
    return <SystemOwnerDashboard />;
  } else if (role === "super_admin") {
    return <SuperAdminDashboard />;
  } else if (role === "admin") {
    return <AdminDashboard />;
  } else if (role === "it_person") {
    return <ItPersonDashboard />;
  }

  return <div>Dashboard</div>;
}
