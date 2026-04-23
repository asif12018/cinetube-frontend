"use server";

import { httpClient } from "@/lib/axios/httpClient";
import jwt from "jsonwebtoken";

interface CheckoutResponse {
  success: boolean;
  data?: {
    checkoutUrl?: string;
  };
}

//user purchase info

import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getPurchaseInfo(mediaId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res = await httpClient.get(
      `${BASE_API_URL}/payment/getPurchase/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    return res.data;
  } catch (error: any) {
    console.error(
      "Fetch Purchase Error:",
      error.response?.data || error.message,
    );
    return null;
  }
}

//get subscription info

export async function getSubscriptionInfo() {
  try {
    // 🟢 Fix: The payment-history endpoint is proven to work correctly.
    // We fetch it and extract just the subscription part to keep compatibility
    // with components that use getSubscriptionInfo.
    const res = await getUserPaymentHistory();
    return res?.data?.subscription || null;
  } catch (error: any) {
    console.error("Fetch Subscription Error:", error);
    return null;
  }
}

//rent or purchase a movie

export async function purchaseAMovie(
  type: "RENTAL" | "ONE_TIME_BUY" | "SUBSCRIPTION",
  mediaId?: string,
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      console.error("No access token found for checkout.");
      return null;
    }

    const payload: { type: string; mediaId?: string } = { type };

    if (type !== "SUBSCRIPTION" && mediaId) {
      payload.mediaId = mediaId;
    }

    // Note: httpClient is returning the raw JSON directly to 'res'
    const res: any = await httpClient.post(
      `${BASE_API_URL}/payment/create-checkout`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    // 🟢 FIXED EXTRACTION LOGIC
    // res is the root object, so we check res.success directly!
    if (res.success && (res.data?.checkoutUrl as string)) {
      return res.data.checkoutUrl as string;
    }

    return null;
  } catch (error: any) {
    console.error("Checkout Error:", error.response?.data || error.message);
    return null;
  }
}

//cancel subscription

export async function cancellSubscription(userId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      console.error("No access token found for checkout.");
      return null;
    }

    const res: any = httpClient.post(
      `${BASE_API_URL}/payment/cancel-subscription`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );
    return res;
  } catch (error: any) {
    console.log(`Error cancelling subscription ${error}`);
    return null;
  }
}

export async function getUserPaymentHistory() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    if (!accessToken) {
      console.error("No access token found for this operation");
      return null;
    }
    const res: any = await httpClient.get(
      `${BASE_API_URL}/payment/payment-history`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    return res;
  } catch (error: any) {
    console.log("error getting purchase history", error);
    return null;
  }
}
