"use client";

import React, { useState, useEffect, use } from 'react';
import { Film, Link as LinkIcon, DollarSign, Calendar, FileText, Upload, Search, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getAllActors } from '@/service/actor.service';
import { getAllGenres } from '@/service/genre.service';
import { getMediaById, updateMedia } from '@/service/media.service';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EditMoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [actorSearch, setActorSearch] = useState("");
  const [isActorDropdownOpen, setIsActorDropdownOpen] = useState(false);

  const { data: actors = [] } = useQuery({ 
    queryKey: ['actors'], 
    queryFn: () => getAllActors() 
  });
  
  const { data: genres = [] } = useQuery({ 
    queryKey: ['genres'], 
    queryFn: () => getAllGenres() 
  });

  const { data: mediaResponse, isLoading: isMediaLoading } = useQuery<any>({
    queryKey: ["media-details", id],
    queryFn: () => getMediaById(id),
  });

  const movie = mediaResponse?.data || mediaResponse;

  const initialFormState = {
    title: "", synopsis: "", releaseYear: "", streamingUrl: "", trailerUrl: "",
    pricingTier: "PREMIUM", status: "PUBLISHED", rentPrice: "", buyPrice: "",
    type: "MOVIE", director: "",
    actorIds: [] as string[], genreIds: [] as string[],
    streamingPlatFrom: "OTHER"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [existingPoster, setExistingPoster] = useState<string | null>(null);
  const [existingBackdrop, setExistingBackdrop] = useState<string | null>(null);

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title || "",
        synopsis: movie.synopsis || "",
        releaseYear: movie.releaseYear?.toString() || "",
        streamingUrl: movie.streamingUrl || "",
        trailerUrl: movie.trailerUrl || "",
        pricingTier: movie.pricingTier || "PREMIUM",
        status: movie.status || "PUBLISHED",
        rentPrice: movie.rentPrice?.toString() || "",
        buyPrice: movie.buyPrice?.toString() || "",
        type: movie.type || "MOVIE",
        director: movie.director || "",
        actorIds: movie.cast?.map((c: any) => c.actorId || c.actor?.id).filter(Boolean) || [],
        genreIds: movie.genres?.map((g: any) => g.genreId || g.genre?.id).filter(Boolean) || [],
        streamingPlatFrom: movie.streamingPlatFrom || "OTHER",
      });
      setExistingPoster(movie.poster || movie.posterUrl || null);
      setExistingBackdrop(movie.backdrop || movie.backdropUrl || null);
    }
  }, [movie]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'poster' | 'backdrop') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        e.target.value = '';
        return;
      }
      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast.error("Only .jpg, .jpeg, .png formats are supported");
        e.target.value = '';
        return;
      }
      if (type === 'poster') setPosterFile(file);
      if (type === 'backdrop') setBackdropFile(file);
    }
  };

  const toggleArrayItem = (id: string, type: 'actorIds' | 'genreIds') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].includes(id) ? prev[type].filter(itemId => itemId !== id) : [...prev[type], id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Updating Media...");
    
    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // If the array is empty, we still want to clear it on the backend
          if (value.length === 0 && key === "genreIds") {
             submitData.append(key, "[]");
          } else if (value.length === 0 && key === "actorIds") {
             submitData.append(key, "[]");
          } else {
             // For Node backend expecting arrays in FormData, we often send multiple same-key values
             value.forEach(item => submitData.append(key, item));
          }
        } else if (value !== "" && value !== null && value !== undefined) {
          submitData.append(key, value as string);
        }
      });
      
      if (posterFile) submitData.append("poster", posterFile);
      if (backdropFile) submitData.append("backdrop", backdropFile);
      
      await updateMedia(id, submitData);
      toast.success("Movie Updated Successfully!", { id: toastId });
      router.push("/dashboard/manageMovies");
    } catch (error: any) {
      toast.error("Failed to update movie!", { id: toastId });
    } finally { 
      setIsLoading(false); 
    }
  };

  if (isMediaLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  const inputBase = "w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-500";
  const labelBase = "block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex-1 bg-[#0a0a0a] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Edit Media</h1>
            <p className="text-gray-400 mt-2">Update movie or series details.</p>
          </div>
          <div className="bg-red-600/10 p-4 rounded-full">
             <Film className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>Movie Title</label>
                  <input required name="title" value={formData.title} placeholder="Enter title" className={inputBase} onChange={handleChange} />
                </div>
                <div>
                  <label className={labelBase}>Release Year</label>
                  <input required name="releaseYear" value={formData.releaseYear} type="number" placeholder="2026" className={inputBase} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label className={labelBase}>Director</label>
                <input required name="director" value={formData.director} placeholder="Christopher Nolan" className={inputBase} onChange={handleChange} />
              </div>

              <div>
                <label className={labelBase}>Synopsis</label>
                <textarea required name="synopsis" value={formData.synopsis} rows={5} placeholder="What is this movie about?" className={inputBase} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>Streaming Source</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input required name="streamingUrl" value={formData.streamingUrl} placeholder="Video URL" className={`${inputBase} pl-10`} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Trailer URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input required name="trailerUrl" value={formData.trailerUrl} placeholder="Trailer URL" className={`${inputBase} pl-10`} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div>
                <label className={labelBase}>Streaming Platform</label>
                <select
                  name="streamingPlatFrom"
                  className={inputBase}
                  onChange={handleChange}
                  value={formData.streamingPlatFrom}
                >
                  <option value="NETFLIX">Netflix</option>
                  <option value="AMAZON_PRIME">Amazon Prime</option>
                  <option value="DISNEY_PLUS">Disney+</option>
                  <option value="HBO_MAX">HBO Max</option>
                  <option value="HULU">Hulu</option>
                  <option value="APPLE_TV">Apple TV</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Cast & Genre Section */}
            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <label className={labelBase}>Select Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g: any) => (
                    <button key={g.id} type="button" onClick={() => toggleArrayItem(g.id, 'genreIds')}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all border ${formData.genreIds.includes(g.id) ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className={labelBase}>Assign Cast</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {actors.filter((a:any) => formData.actorIds.includes(a.id)).map((a:any) => (
                    <div key={a.id} className="bg-red-600/20 border border-red-600/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                      <span className="text-red-400 font-medium">{a.name}</span>
                      <X className="w-4 h-4 cursor-pointer text-red-400" onClick={() => toggleArrayItem(a.id, 'actorIds')} />
                    </div>
                  ))}
                </div>
                <div className="relative">
                   <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                   <input 
                     placeholder="Search actors..." 
                     className={`${inputBase} pl-10`} 
                     value={actorSearch} 
                     onChange={(e) => { setActorSearch(e.target.value); setIsActorDropdownOpen(true); }} 
                     onFocus={() => setIsActorDropdownOpen(true)}
                     onBlur={() => setTimeout(() => setIsActorDropdownOpen(false), 200)}
                   />
                   {isActorDropdownOpen && (
                     <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl max-h-60 overflow-y-auto shadow-2xl custom-scrollbar">
                        {actors.filter((a:any) => {
                          if (!actorSearch.trim()) return true;
                          const terms = actorSearch.toLowerCase().split(/\s+/);
                          return terms.some(term => a.name.toLowerCase().includes(term));
                        }).map((a:any) => (
                          <div key={a.id} onClick={() => toggleArrayItem(a.id, 'actorIds')} className="p-3 hover:bg-red-600/10 cursor-pointer flex items-center justify-between border-b border-gray-800 last:border-0">
                            <span className="text-gray-300">{a.name}</span>
                            {formData.actorIds.includes(a.id) && <Check className="w-4 h-4 text-red-600" />}
                          </div>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Uploads & Pricing */}
          <div className="space-y-6">
            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
               <label className={labelBase}>Media Assets</label>
               <p className="text-xs text-gray-400 -mt-1 mb-4">Leave empty to keep existing images.</p>
               
               <div className="space-y-4">
                 <div className="group relative border-2 border-dashed border-gray-800 hover:border-red-600/50 rounded-xl p-6 transition-all text-center">
                    {existingPoster && !posterFile && (
                      <div className="mb-4 flex justify-center">
                        <Image src={existingPoster} alt="Poster" width={80} height={120} className="rounded object-cover" />
                      </div>
                    )}
                    <ImageIcon className={`w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-red-500 ${existingPoster && !posterFile ? 'hidden' : ''}`} />
                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Replace Poster Image</p>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'poster')} />
                    {posterFile && <p className="text-xs text-green-500 font-bold truncate">{posterFile.name}</p>}
                 </div>

                 <div className="group relative border-2 border-dashed border-gray-800 hover:border-red-600/50 rounded-xl p-6 transition-all text-center">
                    {existingBackdrop && !backdropFile && (
                      <div className="mb-4 flex justify-center">
                        <Image src={existingBackdrop} alt="Backdrop" width={160} height={90} className="rounded object-cover" />
                      </div>
                    )}
                    <ImageIcon className={`w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-red-500 ${existingBackdrop && !backdropFile ? 'hidden' : ''}`} />
                    <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Replace Backdrop Image</p>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'backdrop')} />
                    {backdropFile && <p className="text-xs text-green-500 font-bold truncate">{backdropFile.name}</p>}
                 </div>
               </div>
            </div>

            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <label className={labelBase}>Pricing & Status</label>
              
              <div className="space-y-4">
                <select name="type" className={inputBase} onChange={handleChange} value={formData.type}>
                  <option value="MOVIE">Movie</option>
                  <option value="SERIES">Series</option>
                </select>

                <select name="status" className={inputBase} onChange={handleChange} value={formData.status}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>

                <select name="pricingTier" className={inputBase} onChange={handleChange} value={formData.pricingTier}>
                  <option value="PREMIUM">Premium</option>
                  <option value="FREE">Free</option>
                </select>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input name="rentPrice" value={formData.rentPrice} type="number" placeholder="Rent" className={`${inputBase} pl-10`} onChange={handleChange} disabled={formData.pricingTier === "FREE"} />
                  </div>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input name="buyPrice" value={formData.buyPrice} type="number" placeholder="Buy" className={`${inputBase} pl-10`} onChange={handleChange} disabled={formData.pricingTier === "FREE"} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => router.push("/dashboard/manageMovies")} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest transition-all">
                  Cancel
                </button>
                <button disabled={isLoading} type="submit" className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50">
                  {isLoading ? "Saving..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
