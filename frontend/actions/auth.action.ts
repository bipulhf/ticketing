"use server";

import { LoginRequest } from "@/types/types";
import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const login = async ({ username, password }: LoginRequest) => {
  const cookieStore = await cookies();
  const response = await fetchJson("auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (response.success) {
    cookieStore.set("token", response.data.token);
    cookieStore.set("user", JSON.stringify(response.data.user));
    return response.data;
  } else {
    return { error: response.error.message };
  }
};
