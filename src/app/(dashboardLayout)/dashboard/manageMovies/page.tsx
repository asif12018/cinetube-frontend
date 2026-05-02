"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Edit, Trash2, Search, Plus, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { toast } from "sonner";
import { getMedia, deleteMedia } from "@/service/media.service";
import Image from "next/image";

export default function ManageMoviesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    searchTerm: "",
    status: "",
    pricingTier: "",
    page: 1,
    limit: 10,
  });

  const queryString = new URLSearchParams(
    Object.entries(filters)
      .filter(([_, v]) => v !== "")
      .map(([k, v]) => [k, String(v)]) 
  ).toString();

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media", filters],
    queryFn: () => getMedia(queryString)
  });

  const moviesList = media?.data?.data?.data || media?.data?.data || media?.data || [];
  const meta = media?.meta || media?.data?.meta || { page: 1, totalPages: 1 };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, ...(key !== "page" ? { page: 1 } : {}) }));
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      toast.success("Movie deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
    onError: () => {
      toast.error("Failed to delete movie");
    }
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this movie? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-card p-4 md:p-8 font-sans text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manage Movies</h1>
            <p className="text-muted-foreground mt-2">View, edit, or delete media from the platform.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
                className="bg-[#1a1a1a] border border-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-full md:w-64"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="appearance-none bg-[#1a1a1a] border border-border rounded-lg py-2.5 pl-10 pr-8 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="UNPUBLISHED">Unpublished</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={filters.pricingTier}
                onChange={(e) => handleFilterChange("pricingTier", e.target.value)}
                className="appearance-none bg-[#1a1a1a] border border-border rounded-lg py-2.5 pl-10 pr-8 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer"
              >
                <option value="">All Tiers</option>
                <option value="FREE">Free</option>
                <option value="PREMIUM">Premium</option>
              </select>
            </div>
            <Link 
              href="/dashboard/addMovies"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-foreground py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Movie
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-background border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-foreground">
              <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4">Media</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Release Year</th>
                  <th className="px-6 py-4">Tier</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-red-600 rounded-full animate-spin" />
                        Loading media...
                      </div>
                    </td>
                  </tr>
                ) : moviesList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <Film className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No movies found.</p>
                    </td>
                  </tr>
                ) : (
                  moviesList.map((movie: any) => (
                    <tr key={movie.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-4">
                        <div className="w-10 h-14 bg-muted rounded overflow-hidden flex-shrink-0 relative">
                          {movie.poster ? (
                            <Image src={movie.poster} alt={movie.title} fill className="object-cover" />
                          ) : (
                            <Film className="w-4 h-4 m-auto text-gray-600 mt-5" />
                          )}
                        </div>
                        <div className="max-w-[200px] md:max-w-xs truncate" title={movie.title}>
                          {movie.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${movie.type === 'MOVIE' ? 'bg-blue-600/20 text-blue-400' : 'bg-purple-600/20 text-purple-400'}`}>
                          {movie.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${movie.status === 'PUBLISHED' ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                          {movie.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{movie.releaseYear}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${movie.pricingTier === 'FREE' ? 'bg-gray-700 text-foreground' : 'bg-amber-600/20 text-amber-400'}`}>
                          {movie.pricingTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/dashboard/manageMovies/${movie.id}`}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(movie.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        {!isLoading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-background border border-border p-4 rounded-xl shadow-md">
            <span className="text-sm text-muted-foreground">
              Showing Page <span className="font-bold text-foreground">{meta.page}</span> of <span className="font-bold text-foreground">{meta.totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFilterChange("page", meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-2 rounded-lg bg-muted hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-muted transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1 hidden sm:flex">
                {[...Array(meta.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleFilterChange("page", i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                      meta.page === i + 1 ? "bg-red-600 text-white" : "bg-muted text-foreground hover:bg-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleFilterChange("page", meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-2 rounded-lg bg-muted hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-muted transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
