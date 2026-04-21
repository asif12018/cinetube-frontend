"use server"


//get all the actor

import { httpClient } from "@/lib/axios/httpClient";

const BASE_API_URL = process.env.BASE_API_URL;

export async function getAllActors() {
    try {
        const res:any = await httpClient.get(`/actor`);
        
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