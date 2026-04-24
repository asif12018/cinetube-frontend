"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { MovieCard } from "@/components/ui/movie-card";
import { getMedia, getMediaAllGenre } from "@/service/media.service";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export default function MediaPage() {
  const initialState = {
    searchTerm: "",
    sortBy: "",
    sortOrder: "",
    "avgRating[gte]": "", 
    streamingPlatFrom: "",
    "genres.genre.name": "",
    page: 1, 
    limit: 12, // Switched to 12 for better grid math (2 rows of 6)
  };

  const [filters, setFilters] = useState(initialState);
  const [showFilters, setShowFilters] = useState(false); // Mobile filter toggle

  // Fetch data based on dynamic filters
  const queryString = new URLSearchParams(
    Object.entries(filters)
      .filter(([_, v]) => v !== "")
      .map(([k, v]) => [k, String(v)]) 
  ).toString();

  const { data: media, isLoading } = useQuery<any>({
    queryKey: ["all-media", filters],
    queryFn: () => getMedia(queryString),
  });

  const moviesList = media?.data || [];
  const meta = media?.meta || { page: 1, totalPages: 1 };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => {
      let newFilters = { ...prev, [key]: value };
      
      if (key === "sortBy" && value !== "") {
        newFilters.sortOrder = "desc";
      }

      if (key !== "page") {
        newFilters.page = 1;
      }

      return newFilters;
    });
  };

  // Fetch genres
  const { data: genresResponse } = useQuery<any>({
    queryKey: ["genres"],
    queryFn: () => getMediaAllGenre(),
  });

  const genresList: any[] = Array.isArray(genresResponse)
    ? genresResponse
    : Array.isArray(genresResponse?.data?.data)
    ? genresResponse.data.data
    : Array.isArray(genresResponse?.data)
    ? genresResponse.data
    : [];

  // Reusable sleek styling for dropdowns
  const selectStyle = "appearance-none bg-[#141414] border border-gray-700/50 hover:border-gray-500 rounded-full py-2.5 px-5 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer shadow-lg";

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans flex flex-col">
    

      <main className="pt-28 px-4 md:px-12 pb-16 flex-grow max-w-[2000px] mx-auto w-full">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Movies & Series</h1>
          
          {/* Mobile Filter Toggle */}
          <button 
            className="md:hidden flex items-center gap-2 bg-gray-800 py-2 px-4 rounded-md w-fit"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* FILTER BAR - Netflix Style */}
        <div className={`mb-12 transition-all ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="flex flex-wrap items-center gap-3 bg-black/20 p-2 rounded-2xl">
            
            {/* Search - Primary Focus */}
            <div className="relative flex-grow min-w-[250px] md:max-w-md">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search titles, actors, directors..."
                className="w-full bg-[#2b2b2b]/50 border border-transparent hover:bg-[#2b2b2b] hover:border-gray-600 rounded-full py-3 pl-12 pr-4 text-sm focus:bg-[#141414] focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none transition-all placeholder:text-gray-400"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>

            {/* Pill Dropdowns */}
            <select
              value={filters["genres.genre.name"]}
              className={selectStyle}
              onChange={(e) => handleFilterChange("genres.genre.name", e.target.value)}
            >
              <option value="">All Genres</option>
              {genresList.map((genreItem: any) => (
                !genreItem.isDeleted && (
                  <option key={genreItem.id} value={genreItem.name}>
                    {genreItem.name}
                  </option>
                )
              ))}
            </select>

            <select
              value={filters.streamingPlatFrom}
              className={selectStyle}
              onChange={(e) => handleFilterChange("streamingPlatFrom", e.target.value)}
            >
              <option value="">All Platforms</option>
              <option value="NETFLIX">Netflix</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="AMAZON_PRIME">Amazon Prime</option>
              <option value="HULU">Hulu</option>
              <option value="APPLE_TV">Apple TV</option>
              <option value="HBO_MAX">HBO Max</option>
              <option value="DISNEY_PLUS">Disney Plus</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filters["avgRating[gte]"]}
              className={selectStyle}
              onChange={(e) => handleFilterChange("avgRating[gte]", e.target.value)}
            >
              <option value="">Any Rating</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num.toString()}>{num}+ Stars</option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              className={selectStyle}
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="">Sort: Recommended</option>
              <option value="releaseYear">Newest Releases</option>
              <option value="avgRating">Highest Rated</option>
              <option value="likes">Most Liked</option> 
            </select>

            {/* Reset Button (Only shows if a filter is active) */}
            {Object.values(filters).some(val => val !== "" && val !== 1 && val !== 12) && (
               <button 
                 onClick={() => setFilters(initialState)} 
                 className="flex items-center justify-center gap-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors rounded-full py-2.5 px-4 text-sm font-medium ml-auto"
               >
                 <X className="w-4 h-4" /> Clear All
               </button>
            )}
          </div>
        </div>

        {/* RESULTS GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="aspect-[2/3] bg-gray-800/40 rounded-md animate-pulse shadow-xl" />
             ))}
          </div>
        ) : moviesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
            {moviesList.map((movie: any) => (
              <div key={movie.id} className="transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer">
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <SearchIcon className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No matches found</h3>
            <p className="text-gray-400 max-w-md">We couldn't find anything matching your filters. Try adjusting your search or clearing the filters.</p>
          </div>
        )}

        {/* PAGINATION */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-20">
            <button
              onClick={() => handleFilterChange("page", meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-3 rounded-full bg-[#2b2b2b] hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-[#2b2b2b] transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-2">
              {[...Array(meta.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterChange("page", i + 1)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    meta.page === i + 1 ? "bg-red-600 scale-125" : "bg-gray-600 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleFilterChange("page", meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-3 rounded-full bg-[#2b2b2b] hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-[#2b2b2b] transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}