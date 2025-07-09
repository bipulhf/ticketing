import { SystemOwnerUsersList } from "@/components/system-owner/users-list";
import { cookies } from "next/headers";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  const role = JSON.parse(user!).role;

  if (role === "system_owner") {
    return <SystemOwnerUsersList />;
  }

  return <div>Users</div>;
}
