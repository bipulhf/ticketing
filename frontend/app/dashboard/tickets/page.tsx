import { cookies } from "next/headers";
import { Suspense } from "react";
import TicketsPageWrapper from "@/components/tickets/tickets-page-wrapper";

export default async function Page() {
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">User not authenticated</p>
        </div>
      </div>
    );
  }

  let role;
  try {
    const parsedUser = JSON.parse(user);
    role = parsedUser.role;
  } catch (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">Failed to parse user data</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="container mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Loading tickets...</h2>
            <p className="text-muted-foreground">
              Please wait while we initialize the page.
            </p>
          </div>
        </div>
      }
    >
      <TicketsPageWrapper userRole={role} />
    </Suspense>
  );
}
