"use server";

import { httpClient } from "@/lib/axios/httpClient";







const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export const getAllGenres = async () => {
  try {
    const response: any = await httpClient.get(`/genre`);
    
    // httpClient already returns the parsed response body (response.data from axios)
    if (response.success && Array.isArray(response.data)) {
      return response.data.filter((genre: any) => !genre.isDeleted);
    }
    
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch genres", error);
    return [];
  }
}