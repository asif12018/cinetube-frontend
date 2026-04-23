"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getMedia(queryString?: string) {
  try {
    const res:any = await httpClient.get(`${BASE_API_URL}/media?${queryString}`);
    return res.data;
  } catch (error: any) {
    console.log("Error fetching media:", error);
    throw error;
  }
}

export async function getMediaById(id: string) {
  try {
    const res = await httpClient.get(`${BASE_API_URL}/media/${id}`);
    return res.data;
  } catch (error: any) {
    console.log("Error fetching media by id:", error);
    throw error;
  }
}

//get all the media by genre (plain fetch — no auth needed, safe to call from client)
export async function getMediaAllGenre() {
  try {
    const res = await fetch(`${BASE_API_URL}/genre`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch genres");
    return res.json();
  } catch (error: any) {
    console.log("Error fetching media genre", error);
    throw error;
  }
}

//create movie
// src/service/admin.service.ts

export async function createNewMedia (mediaData: FormData) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    // We send mediaData directly, and explicitly tell Axios it's multipart/form-data
    const response = await httpClient.post(`${BASE_API_URL}/media/create-media`, mediaData, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating media:", error);
    // We throw the error so the try/catch in your React component can catch it and show the Sonner toast!
    throw error;
  }
};

export async function updateMedia(id: string, mediaData: FormData) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    const response = await httpClient.patch(`${BASE_API_URL}/media/update-media/${id}`, mediaData, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error updating media:", error);
    throw error;
  }
}

export async function deleteMedia(id: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    const response = await httpClient.delete(`${BASE_API_URL}/media/delete-media/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error deleting media:", error);
    throw error;
  }
}
