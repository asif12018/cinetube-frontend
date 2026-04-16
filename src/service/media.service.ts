"use server"

import { httpClient } from "@/lib/axios/httpClient";







const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;




export async function getMedia(queryString?: string ){
    try{
      
        const res = await httpClient.get(`${BASE_API_URL}/media?${queryString}`);
        return res.data;

    }catch(error:any){
       console.log("Error fetching media:", error);
        throw error;
    }
}


export async function getMediaById(id:string){
    try{
        const res = await httpClient.get(`${BASE_API_URL}/media/${id}`);
        return res.data;
    }catch(error:any){
        console.log("Error fetching media by id:", error);
        throw error;
    }
}


//get all the media by genre

export async function getMediaAllGenre(){
    try{
        const res = await httpClient.get(`${BASE_API_URL}/genre`);
        return res.data;
    }catch(error:any){
        console.log("Error fetching media genre", error);
        throw error;
    }
}