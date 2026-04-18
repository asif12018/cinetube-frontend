"use server"

import { httpClient } from "@/lib/axios/httpClient";


const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function getAllTags() {
  try {
    const result = await httpClient.get(`${BASE_API_URL}/tags`);
    // Bulletproof extraction
    return result.data ? result.data : result;
  } catch (error: any) {
    console.log("Failed to fetch tags", error);
    return null;
  }
}