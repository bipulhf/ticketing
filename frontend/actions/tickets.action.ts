"use server";

import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const getTickets = async ({
  page = 1,
  limit = 10,
  status,
  fromDate,
  toDate,
}: {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
} = {}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status) {
    params.append("status", status);
  }
  if (fromDate) {
    params.append("fromDate", fromDate);
  }
  if (toDate) {
    params.append("toDate", toDate);
  }

  const response = await fetchJson(`tickets?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const getTicketById = async (ticketId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`tickets/${ticketId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const createTicket = async (ticketData: {
  description: string;
  attachments?: File[];
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson("tickets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const updateTicket = async (
  ticketId: string,
  ticketData: {
    description?: string;
    status?: string;
    notes?: string;
  }
) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`tickets/${ticketId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketData),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const deleteTicket = async (ticketId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`tickets/${ticketId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};
