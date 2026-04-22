"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Film, Edit, Trash2, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { getMedia, deleteMedia } from "@/service/media.service";
import Image from "next/image";

export default function ManageMoviesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: media, isLoading } = useQuery({
    queryKey: ["admin-media", searchTerm],
    queryFn: () => getMedia(searchTerm ? `searchTerm=${searchTerm}` : "")
  });

  const moviesList = media?.data?.data?.data || media?.data?.data || media?.data || [];

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
    <div className="min-h-screen w-full flex-1 bg-[#0a0a0a] p-4 md:p-8 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manage Movies</h1>
            <p className="text-gray-400 mt-2">View, edit, or delete media from the platform.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-full md:w-64"
              />
            </div>
            <Link 
              href="/dashboard/addMovies"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Movie
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
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
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-4">
                        <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden flex-shrink-0 relative">
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
                      <td className="px-6 py-4 text-gray-400">{movie.releaseYear}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${movie.pricingTier === 'FREE' ? 'bg-gray-700 text-gray-300' : 'bg-amber-600/20 text-amber-400'}`}>
                          {movie.pricingTier}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/dashboard/manageMovies/${movie.id}`}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
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

      </div>
    </div>
  );
}
