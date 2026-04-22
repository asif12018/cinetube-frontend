"use server"
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

import { revalidatePath } from "next/cache";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAllUserNotification() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    // Add a timestamp query parameter to bust any potential API caches
    const timestamp = new Date().getTime();
    const res: any = await httpClient.get(
      `${BASE_API_URL}/notification?t=${timestamp}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    console.log("NOTIFICATIONS FETCHED:", JSON.stringify(res.data, null, 2));
    return res.data;
  } catch (error: any) {
    console.log("notification fetch error", error);
    return null;
  }
}

export async function readNotification() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res: any = await httpClient.post(
      `${BASE_API_URL}/notification`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    revalidatePath("/", "layout");
    return res.data;
  } catch (error: any) {
    console.log("notification read error", error);
    throw error;
  }
}
