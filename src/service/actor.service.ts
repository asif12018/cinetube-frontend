"use server"


//get all the actor

import { httpClient } from "@/lib/axios/httpClient";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getAllActors() {
    try {
        const res:any = await httpClient.get(`${BASE_API_URL}/actor?limit=1000`);
        
        if (res.data && Array.isArray(res.data)) {
            return res.data;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return [];
    } catch (error: any) {
        console.log('error from actor service', error);
        return [];
    }
}

export async function createActor(actorData: FormData) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;
        const response = await httpClient.post(`${BASE_API_URL}/actor/create-actor`, actorData, {
            headers: {
                Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error creating actor:", error);
        throw error;
    }
}

export async function updateActor(id: string, actorData: FormData) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;
        const response = await httpClient.patch(`${BASE_API_URL}/actor/update-actor/${id}`, actorData, {
            headers: {
                Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error updating actor:", error);
        throw error;
    }
}

export async function deleteActor(id: string) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;
        const response = await httpClient.delete(`${BASE_API_URL}/actor/delete-actor/${id}`, {
            headers: {
                Authorization: `Bearer ${accessToken}; better-auth.session_token=${sessionToken}`,
            },
        });
        return response.data;
    } catch (error: any) {
        console.error("Error deleting actor:", error);
        throw error;
    }
}