"use server"
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";





const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



export async function getMovieReviewByMovieId(movieId: string) {
   try{
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;
    if(!accessToken){
        console.error("access token not found");
        return null
    }
    
    const res = await httpClient.get(`${BASE_API_URL}/reviews/${movieId}`,{
         headers: {
       Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    })
    return res.data;
   }catch(error:any){
     console.log("failed to get movie review", error);
   }
}