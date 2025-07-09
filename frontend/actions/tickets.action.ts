"use server";

import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const getTickets = async ({
  page = 1,
  limit = 10,
  status,
  fromDate,
  toDate,
  search,
}: {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
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
  if (search) {
    params.append("search", search);
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
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
  attachments?: Array<{
    name: string;
    url: string;
    fileType?: string;
  }>;
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

export const createTicketWithFiles = async (ticketData: {
  description: string;
  ip_address?: string;
  device_name?: string;
  ip_number?: string;
  uploadedFiles: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Transform uploaded files to attachment format
  const attachments = ticketData.uploadedFiles.map((file) => ({
    name: file.name,
    url: file.url,
    fileType: file.type.split("/")[1],
  }));

  const requestData = {
    description: ticketData.description,
    ip_address: ticketData.ip_address,
    device_name: ticketData.device_name,
    ip_number: ticketData.ip_number,
    attachments,
  };

  const response = await fetchJson("tickets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
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

export const closeTicket = async (ticketId: string, notes: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`tickets/${ticketId}/close`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ notes }),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const reopenTicket = async (ticketId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`tickets/${ticketId}/reopen`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};
