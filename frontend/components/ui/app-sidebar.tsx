import { Home, Users, Ticket, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/types";
import { LogoutButton } from "../login/logout-button";
import Link from "next/link";

const generateMenuItems = (role: UserRole) => {
  if (role === "system_owner") {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Tickets", url: "/dashboard/tickets", icon: Ticket },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  } else if (role === "super_admin") {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Tickets", url: "/dashboard/tickets", icon: Ticket },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  } else if (role === "admin") {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Tickets", url: "/dashboard/tickets", icon: Ticket },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  } else if (role === "it_person") {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Manage Tickets", url: "/dashboard/tickets", icon: Ticket },
      { title: "Users", url: "/dashboard/users", icon: Users },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  } else if (role === "user") {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "My Tickets", url: "/dashboard/tickets", icon: Ticket },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  } else {
    return [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];
  }
};

export function AppSidebar({ role }: { role: UserRole }) {
  const items = generateMenuItems(role);

  return (
    <Sidebar>
      <SidebarHeader className="my-4">
        <Link
          href="/dashboard"
          className="text-center flex items-center gap-2 justify-center"
        >
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
              <Ticket className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-lg font-bold text-slate-800">HelpDesk Pro</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col justify-between min-h-[calc(100vh-7rem)]">
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <LogoutButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
