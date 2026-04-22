"use server";
import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export async function getMovieReviewByMovieId(movieId: string) {
//   try {
//     const cookieStore = await cookies();
//     const accessToken = cookieStore.get("accessToken")?.value;
//     const sessionToken = cookieStore.get("better-auth.session_token")?.value;
//     if (!accessToken) {
//       console.error("access token not found");
//       return null;
//     }

//     const res = await httpClient.get(`${BASE_API_URL}/reviews/${movieId}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
//       },
//     });
//     return res.data;
//   } catch (error: any) {
//     console.log("failed to get movie review", error);
//   }
// }

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

export const getMovieReviewByMovieId = async (mediaId: string) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const res = await httpClient.get(`${BASE_API_URL}/reviews/${mediaId}`, {
      // 🟢 Pass the tokens so the backend's checkAuth middleware lets you in!
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      }
    });

    return res.data;
  } catch (error: any) {
    console.log("Error fetching reviews", error);
    return null;
  }
};


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



export async function updateReview(reviewId: string, content: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    // 🟢 Hitting your existing PATCH route: router.patch("/:id", ...)
    const res:any = await httpClient.patch(
      `${BASE_API_URL}/reviews/${reviewId}`,
      { content: content }, // Sending the updated text
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      }
    );
    
    return res.data;
  } catch (error: any) {
    // Log the error from your backend AppError (e.g., "You can only edit pending reviews")
    console.error("Error updating review:", error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message };
  }
}

export async function getUnPublishedReviews() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const res:any = await httpClient.get(`${BASE_API_URL}/reviews`, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    return res.data;
  } catch (error: any) {
    console.error("Error fetching unpublished reviews:", error);
    return null;
  }
}

export async function updateReviewStatus(reviewId: string, status: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const res: any = await httpClient.patch(
      `${BASE_API_URL}/reviews/status/${reviewId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
        },
      }
    );

    return res.data;
  } catch (error: any) {
    console.error("Error updating review status:", error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message };
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const res: any = await httpClient.delete(`${BASE_API_URL}/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    return res.data;
  } catch (error: any) {
    console.error("Error deleting review:", error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message };
  }
}
