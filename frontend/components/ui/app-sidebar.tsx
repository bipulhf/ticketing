import { Archive, Home, Users, Ticket, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserRole } from "@/types/types";
import { LogoutButton } from "../login/logout-button";

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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>HelpDesk Pro</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col justify-between min-h-[calc(100vh-3rem)]">
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
