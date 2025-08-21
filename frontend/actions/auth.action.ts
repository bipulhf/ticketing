"use server";

import { LoginRequest } from "@/types/types";
import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("user");
};

export const login = async ({ username, password }: LoginRequest) => {
  const cookieStore = await cookies();
  const response = await fetchJson("auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (response.success) {
    cookieStore.set("token", response.data.token, {
      maxAge: 60 * 60 * 24, // 1 calendar day
    });
    cookieStore.set("user", JSON.stringify(response.data.user), {
      maxAge: 60 * 60 * 24, // 1 calendar day
    });
    return response.data;
  }
  return { error: response.error.message };
};
