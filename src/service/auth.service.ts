"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if(!BASE_API_URL){
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getNewTokensWithRefreshToken(refreshToken  : string) : Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                Cookie : `refreshToken=${refreshToken}`
            }
        });

        if(!res.ok){
            return false;
        }

        const {data} = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if(accessToken){
            await setTokenInCookies("accessToken", accessToken);
        }

        if(newRefreshToken){
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        if(token){
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/authUser`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
        });

        // console.log(res, "res from getUserInfo")

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const { data } = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

export async function updateUserProfile(userId: string, formData: FormData) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            return { success: false, message: "No token provided" };
        }

        const res = await fetch(`${BASE_API_URL}/auth/update-user/${userId}`, {
            method: "PATCH",
            headers: {
                // Next.js automatically sets the correct Content-Type with boundary for FormData
                Authorization: `Bearer ${accessToken}`,
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            },
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            return { 
                success: false, 
                message: errorData?.message || `Failed to update profile: ${res.statusText}` 
            };
        }

        const { data } = await res.json();
        return { success: true, data };
    } catch (error: any) {
        console.error("Error updating user info:", error);
        return { success: false, message: error.message || "An unexpected error occurred" };
    }
}

export async function logoutUserAction() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (sessionToken) {
      // 1. Call your actual backend API to invalidate the session in the database
      // If you are calling an external backend (like your Render server):
      await fetch(`${BASE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      // OR if you are using your provided function directly in the Next.js server:
      // await logOutUser(sessionToken);
    }

    // 2. CRITICAL: Delete the cookies from the user's browser!
    cookieStore.delete("better-auth.session_token");
    cookieStore.delete("accessToken"); // Delete this too if you use it
    cookieStore.delete("refreshToken");

    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false, message: "Failed to log out" };
  }
}
