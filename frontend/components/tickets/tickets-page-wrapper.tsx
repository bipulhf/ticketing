"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getTickets } from "@/actions/tickets.action";
import TicketsPage from "./tickets-page";
import {
  TicketsListResponse,
  UserRole,
  ITDepartment,
  Location,
} from "@/types/types";

interface TicketsPageWrapperProps {
  userRole: UserRole;
}

export default function TicketsPageWrapper({
  userRole,
}: TicketsPageWrapperProps) {
  const searchParams = useSearchParams();
  const [ticketsData, setTicketsData] = useState<TicketsListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{
    department?: ITDepartment;
    userLocation?: Location;
  } | null>(null);

  // Get user information from cookies
  useEffect(() => {
    const getUserInfo = () => {
      try {
        const userCookie = document.cookie
          .split("; ")
          .find((row) => row.startsWith("user="));

        if (userCookie) {
          const userData = JSON.parse(
            decodeURIComponent(userCookie.split("=")[1])
          );
          setUserInfo({
            department: userData.department,
            userLocation: userData.userLocation,
          });
        }
      } catch (error) {
        console.error("Error parsing user cookie:", error);
      }
    };

    getUserInfo();
  }, []);

  // Get search params
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const status = searchParams.get("status");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const search = searchParams.get("search");

  // Fetch tickets when search params change
  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getTickets({
          page: page ? parseInt(page, 10) : 1,
          limit: limit ? parseInt(limit, 10) : 10,
          status: status || undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          search: search || undefined,
        });

        // Handle error response
        if ("error" in response) {
          setError(response.error);
          setTicketsData(null);
        } else {
          setTicketsData(response);
          setError(null);
        }
      } catch (err) {
        setError("An unexpected error occurred while loading tickets.");
        setTicketsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [page, limit, status, fromDate, toDate, search]);

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-muted-foreground">
            Failed to load tickets: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <TicketsPage
      data={ticketsData?.tickets || []}
      pagination={
        ticketsData?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }
      }
      userType={userRole}
      userDepartment={userInfo?.department}
      userLocation={userInfo?.userLocation}
      isLoading={loading}
      error={error}
    />
  );
}
