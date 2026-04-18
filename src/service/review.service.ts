"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getMovieReviewByMovieId(movieId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    if (!accessToken) {
      console.error("access token not found");
      return null;
    }

    const res = await httpClient.get(`${BASE_API_URL}/reviews/${movieId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.log("failed to get movie review", error);
  }
}

//create review
export async function createReview(payload: any, movieId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) return null;

    const result = await httpClient.post(
      `${BASE_API_URL}/reviews/${movieId}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          // ✅ FIXED: Used the proven Authorization header format
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      }
    );

    // Bulletproof extraction
    return result;
  } catch (error: any) {
    console.log("failed to create review", error);
    return null;
  }
}


//

export async function isUserHasAreview(movieId:string){
    try{
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const sessionToken = cookieStore.get("better-auth.session_token")?.value;

      if (!accessToken) return null;

      const res = await httpClient.get(`${BASE_API_URL}/reviews/checkUserReview/${movieId}`,{
        headers:{
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        }
      });
      
      // 🟢 FIXED: You forgot to return the response!
      // This ensures we always return the data, or at least 'null', but NEVER 'undefined'
      return res?.data ?? res ?? null;

    }catch(error:any){
      console.log("failed checking review", error);
      // It's better to return null here instead of false so React Query stays consistent
      return null; 
    }
}
