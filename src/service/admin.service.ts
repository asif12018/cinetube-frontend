
"use server"
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function getDashboardStats() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  try {
    if(!accessToken){
        return null
    }
    const res:any = await httpClient.get(`${BASE_API_URL}/admin/analytics`,{
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        }
    });
    return res;
  } catch (error: any) {
    console.log('error from admin dashboard stats', error);
    return null
  }
}
