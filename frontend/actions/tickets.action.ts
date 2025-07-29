"use server";

import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";
import { ITDepartment, Location, UserDepartment } from "@/types/types";

export const getTickets = async ({
  page = 1,
  limit = 10,
  status,
  fromDate,
  toDate,
  search,
  department,
  location,
  user_department,
}: {
  page?: number;
  limit?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  department?: string;
  location?: string;
  user_department?: string;
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
  if (department) {
    params.append("department", department);
  }
  if (location) {
    params.append("location", location);
  }
  if (user_department) {
    params.append("user_department", user_department);
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
  ip_address: string;
  device_name: string;
  ip_number: string;
  department: ITDepartment;
  location: Location;
  user_department?: UserDepartment;
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
  ip_address: string;
  device_name: string;
  ip_number: string;
  department: ITDepartment;
  uploadedFiles: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const ticketPayload = {
    description: ticketData.description,
    ip_address: ticketData.ip_address,
    device_name: ticketData.device_name,
    ip_number: ticketData.ip_number,
    department: ticketData.department,
    attachments: ticketData.uploadedFiles.map((file) => ({
      name: file.name,
      url: file.url,
      fileType: file.type,
    })),
  };

  const response = await fetchJson("tickets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ticketPayload),
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
    ip_address?: string;
    device_name?: string;
    ip_number?: string;
    department?: ITDepartment;
    location?: Location;
    user_department?: UserDepartment;
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
    method: "PUT",
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
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const getTicketSearchOptions = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson("tickets/search-options", {
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
