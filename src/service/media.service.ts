"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getMedia(queryString?: string) {
  try {
    const res = await httpClient.get(`${BASE_API_URL}/media?${queryString}`);
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

//get all the media by genre

export async function getMediaAllGenre() {
  try {
    const res = await httpClient.get(`${BASE_API_URL}/genre`);
    return res.data;
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
    const response = await httpClient.post("/media/create-media", mediaData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error creating media:", error);
    // We throw the error so the try/catch in your React component can catch it and show the Sonner toast!
    throw error;
  }
};
