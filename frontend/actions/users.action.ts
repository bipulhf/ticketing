"use server";

import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const getUsersForSystemOwner = async ({
  params,
}: {
  params?: URLSearchParams;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetchJson(`users/my-users?${params}`, {
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

export const getAllUsersByType = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
} = {}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await fetchJson(`users/all-by-type?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.success) {
    return response.data.data;
  }
  return { error: response.error.message };
};
