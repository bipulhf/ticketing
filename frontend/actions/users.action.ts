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

export const getUserById = async (userId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`users/${userId}`, {
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

export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
  role: string;
  businessType?: string;
  accountLimit?: number;
  expiryDate?: string;
  location?: string;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Determine the correct endpoint based on role
  let endpoint = "users/create-user";
  switch (userData.role) {
    case "super_admin":
      endpoint = "users/create-super-admin";
      break;
    case "admin":
      endpoint = "users/create-admin";
      break;
    case "it_person":
      endpoint = "users/create-it-person";
      break;
    case "user":
      endpoint = "users/create-user";
      break;
    default:
      endpoint = "users/create-user";
  }

  const response = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      ...(userData.expiryDate && {
        expiryDate: new Date(userData.expiryDate).toISOString(),
      }),
    }),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const updateUser = async (
  userId: string,
  userData: {
    username?: string;
    email?: string;
    businessType?: string;
    accountLimit?: number;
    expiryDate?: string;
    location?: string;
    isActive?: boolean;
  }
) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`users/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...userData,
      ...(userData.expiryDate && {
        expiryDate: new Date(userData.expiryDate).toISOString(),
      }),
    }),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const deleteUser = async (userId: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson(`users/${userId}`, {
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

export const updateSelfProfile = async (userData: {
  username?: string;
  email?: string;
  location?: string;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson("users/self/profile", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};

export const updateSelfPassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const response = await fetchJson("users/self/password", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  if (response.success) {
    return response.data;
  }
  return { error: response.error.message };
};
