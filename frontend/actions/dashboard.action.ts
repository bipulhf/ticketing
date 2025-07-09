"use server";

import { UserRole } from "@/types/types";
import { fetchJson } from "@/utils/custom-fetch";
import { cookies } from "next/headers";

export const getDashboardData = async ({
  params,
  userType = "system_owner",
}: {
  params?: URLSearchParams;
  userType?: UserRole;
}) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const responsePromise = fetchJson(`dashboard/metrics?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const response1Promise = fetchJson(
    `dashboard/${userType.replace("_", "-")}?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const [response, response1] = await Promise.all([
    responsePromise,
    response1Promise,
  ]);

  if (response.success && response1.success) {
    return {
      metrics: response.data.metrics,
      systemOwner: response1.data.dashboard,
    };
  }

  if (!response.success) {
    return { error: response.error.message };
  }

  if (!response1.success) {
    return { error: response1.error.message };
  }
};
