import { AdminUsersList } from "@/components/admin/users-list";
import { SuperAdminUsersList } from "@/components/super-admin/users-list";
import { SystemOwnerUsersList } from "@/components/system-owner/users-list";
import { cookies } from "next/headers";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  const role = JSON.parse(user!).role;

  if (role === "system_owner") {
    return <SystemOwnerUsersList />;
  } else if (role === "super_admin") {
    return <SuperAdminUsersList />;
  } else if (role === "admin") {
    return <AdminUsersList />;
  }
  return <div>Users</div>;
}
