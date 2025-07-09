import { getTickets } from "@/actions/tickets.action";
import TicketsPage from "@/components/tickets/tickets-page";
import { TicketsListResponse } from "@/types/types";
import { cookies } from "next/headers";

interface TicketsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }>;
}

export default async function Page({ searchParams }: TicketsPageProps) {
  const { page, limit, status, fromDate, toDate } = await searchParams;
  const cookieStore = await cookies();
  const user = cookieStore.get("user")?.value;
  const role = JSON.parse(user!).role;
  try {
    const response = await getTickets({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
      fromDate,
      toDate,
    });

    // Handle error response
    if ("error" in response) {
      return (
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-muted-foreground">
              Failed to load tickets: {response.error}
            </p>
          </div>
        </div>
      );
    }

    // Extract tickets and pagination from response
    const ticketsData: TicketsListResponse = response;

    return (
      <TicketsPage
        data={ticketsData.tickets}
        pagination={ticketsData.pagination}
        userType={role}
      />
    );
  } catch (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred while loading tickets.
          </p>
        </div>
      </div>
    );
  }
}
