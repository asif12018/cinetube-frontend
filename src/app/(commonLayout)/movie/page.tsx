"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/navbar";
import { MovieCard } from "@/components/ui/movie-card";
import { getMedia, getMediaAllGenre } from "@/service/media.service";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X, ChevronLeft, ChevronRight } from "lucide-react"; // Import Chevrons

export default function MediaPage() {
  const initialState = {
    searchTerm: "",
    sortBy: "",
    sortOrder: "",
    "avgRating[gte]": "", 
    streamingPlatFrom: "",
    "genres.genre.name": "",
    page: 1, // 🔴 ADDED PAGE STATE
    limit: 10, // You can adjust this to 12 or 18 so it fits the grid perfectly
  };

  const [filters, setFilters] = useState(initialState);

  // Fetch data based on dynamic filters
  const queryString = new URLSearchParams(
    // We convert everything to strings so URLSearchParams works correctly
    Object.entries(filters)
      .filter(([_, v]) => v !== "")
      .map(([k, v]) => [k, String(v)]) 
  ).toString();

  const { data: media, isLoading } = useQuery<any>({
    queryKey: ["all-media", filters],
    queryFn: () => getMedia(queryString),
  });

  console.log(media, 'this is media')

  const moviesList = media?.data?.data || media?.data || [];
  // 🔴 EXTRACT PAGINATION META DATA
  const meta = media?.meta || { page: 1, totalPages: 1 };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => {
      let newFilters = { ...prev, [key]: value };
      
      // If we pick a sort option, let's automatically make it descending (highest first)
      if (key === "sortBy" && value !== "") {
        newFilters.sortOrder = "desc";
      }

      // 🔴 IMPORTANT: If the user changes a filter (like genre or search), reset back to page 1
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

  const genresList = genresResponse?.data?.data || genresResponse?.data || [];
  console.log("META DATA FROM BACKEND:", meta);

  return (
    <div className="min-h-screen bg-netflix-bg text-white font-sans flex flex-col">
      <Navbar />

      <main className="pt-28 px-4 md:px-12 pb-10 flex-grow">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Browse Library</h1>

          {/* SINGLE, CLEAN FILTER BAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-900/40 p-6 rounded-xl border border-gray-800">
            
            {/* 1. Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Title, Cast, Director..."
                className="w-full bg-black/40 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:border-red-600 outline-none"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>

            {/* 2. Genre */}
            <select
              value={filters["genres.genre.name"]}
              className="bg-black/40 border border-gray-700 rounded-md py-2 px-4 text-sm outline-none focus:border-red-600"
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

            {/* 3. Platform */}
            <select
              value={filters.streamingPlatFrom}
              className="bg-black/40 border border-gray-700 rounded-md py-2 px-4 text-sm outline-none focus:border-red-600"
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
            </select>

            {/* 4. Min Rating */}
            <select
              value={filters["avgRating[gte]"]}
              className="bg-black/40 border border-gray-700 rounded-md py-2 px-4 text-sm outline-none focus:border-red-600"
              onChange={(e) => handleFilterChange("avgRating[gte]", e.target.value)}
            >
              <option value="">Minimum Rating</option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num.toString()}>{num}+ Stars</option>
              ))}
            </select>

            {/* 5. Sort By */}
            <select
              value={filters.sortBy}
              className="bg-black/40 border border-gray-700 rounded-md py-2 px-4 text-sm outline-none focus:border-red-600"
              onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            >
              <option value="">Sort By...</option>
              <option value="releaseYear">Recent (Newest First)</option>
              <option value="avgRating">Top Rated</option>
              <option value="likes">Most Liked</option> 
            </select>

            {/* 6. Reset Filters */}
            <button 
              onClick={() => setFilters(initialState)} 
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 transition-colors rounded-md py-2 px-4 text-sm"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        </header>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="h-72 bg-gray-800/40 rounded-lg animate-pulse" />
             ))}
          </div>
        ) : moviesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-y-10 gap-x-4">
            {moviesList.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No movies found matching your filters.</p>
          </div>
        )}

        {/* 🔴 PAGINATION CONTROLS */}
        {!isLoading  && (
          <div className="flex items-center justify-center gap-4 mt-16 border-t border-gray-800 pt-8">
            <button
              onClick={() => handleFilterChange("page", meta.page - 1)}
              disabled={meta.page <= 1}
              className="p-2 rounded-full bg-gray-800 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <span className="text-gray-400 font-medium">
              Page {meta.page} of {meta.totalPages}
            </span>

            <button
              onClick={() => handleFilterChange("page", meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="p-2 rounded-full bg-gray-800 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}