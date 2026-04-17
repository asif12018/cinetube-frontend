
"use server"
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function toggleWatchList(mediaId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res: any = await httpClient.post(
      `${BASE_API_URL}/watchlist/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    return res.data;
  } catch (error: any) {
    console.log("watchlist error", error);
    return null;
  }
}


export async function checkTheMovieOnWatchList(mediaId: string) {
  try{
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res: any = await httpClient.get(
      `${BASE_API_URL}/watchlist/checkWatchList/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      },
    );

    return res.data;
  }catch(error:any){
    console.log("watchlist error", error);
    return null;
  }
}