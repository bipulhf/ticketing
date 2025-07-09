import { AppSidebar } from "@/components/ui/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  if (!user) {
    redirect("/login");
  }

  const role = JSON.parse(user).role;
  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <main className="py-2 px-5 w-full">
        <Toaster position="bottom-right" richColors expand theme="light" />
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
