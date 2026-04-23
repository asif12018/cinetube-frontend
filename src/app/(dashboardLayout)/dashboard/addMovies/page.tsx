"use client";

import React, { useState } from "react";
import {
  Film,
  Link as LinkIcon,
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Search,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getAllActors } from "@/service/actor.service";
import { getAllGenres } from "@/service/genre.service";
import { createNewMedia } from "@/service/media.service";
export default function AddMoviesPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [actorSearch, setActorSearch] = useState("");
  const [isActorDropdownOpen, setIsActorDropdownOpen] = useState(false);

  // 🟢 Wrap them in arrow functions!
  const { data: actors = [] } = useQuery({
    queryKey: ["actors"],
    queryFn: () => getAllActors(),
  });

  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: () => getAllGenres(),
  });

  const initialFormState = {
    title: "",
    synopsis: "",
    releaseYear: "",
    streamingUrl: "",
    trailerUrl: "",
    pricingTier: "PREMIUM",
    status: "PUBLISHED",
    rentPrice: "5",
    buyPrice: "30",
    type: "MOVIE",
    director: "",
    actorIds: [] as string[],
    genreIds: [] as string[],
  };

  const [formData, setFormData] = useState(initialFormState);

  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [backdropFile, setBackdropFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "poster" | "backdrop",
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "poster") setPosterFile(e.target.files[0]);
      if (type === "backdrop") setBackdropFile(e.target.files[0]);
    }
  };

  const toggleArrayItem = (id: string, type: "actorIds" | "genreIds") => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((itemId) => itemId !== id)
        : [...prev[type], id],
    }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!posterFile || !backdropFile) return toast.error("Upload both images!");
  //   setIsLoading(true);
  //   const toastId = toast.loading("Creating Media...");
  //   try {
  //     const submitData = new FormData();
  //     Object.entries(formData).forEach(([key, value]) => {
  //       if (Array.isArray(value)) {
  //         value.forEach(item => submitData.append(key, item));
  //       } else {
  //         submitData.append(key, value as string);
  //       }
  //     });

  //     const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  //     submitData.append("slug", slug);

  //     submitData.append("poster", posterFile);
  //     submitData.append("backdrop", backdropFile);
  //     await createNewMedia(submitData);
  //     toast.success("Published!", { id: toastId });
  //   } catch (error: any) {
  //     toast.error("Failed!", { id: toastId });
  //   } finally { setIsLoading(false); }
  // };

  // Modern Input Styles

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!posterFile || !backdropFile) return toast.error("Upload both images!");
    setIsLoading(true);
    const toastId = toast.loading("Creating Media...");

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((item) => submitData.append(key, item));
        } else {
          submitData.append(key, value as string);
        }
      });

      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      submitData.append("slug", slug);

      submitData.append("poster", posterFile);
      submitData.append("backdrop", backdropFile);

      await createNewMedia(submitData);
      toast.success("Published!", { id: toastId });

      setFormData(initialFormState);
      setPosterFile(null);
      setBackdropFile(null);
      setActorSearch("");
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error("Failed!", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  const inputBase =
    "w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-500";
  const labelBase =
    "block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider";

  return (
    <div className="min-h-screen w-full flex-1 bg-[#0a0a0a] p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Create New Media
            </h1>
            <p className="text-gray-400 mt-2">
              Add cinematic content to your global library.
            </p>
          </div>
          <div className="bg-red-600/10 p-4 rounded-full">
            <Film className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>Movie Title</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    placeholder="Enter title"
                    className={inputBase}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className={labelBase}>Release Year</label>
                  <input
                    required
                    name="releaseYear"
                    value={formData.releaseYear}
                    type="number"
                    placeholder="2026"
                    className={inputBase}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelBase}>Director</label>
                <input
                  required
                  name="director"
                  value={formData.director}
                  placeholder="Christopher Nolan"
                  className={inputBase}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className={labelBase}>Synopsis</label>
                <textarea
                  required
                  name="synopsis"
                  value={formData.synopsis}
                  rows={5}
                  placeholder="What is this movie about?"
                  className={inputBase}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelBase}>Streaming Source</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      required
                      name="streamingUrl"
                      value={formData.streamingUrl}
                      placeholder="Video URL"
                      className={`${inputBase} pl-10`}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>Trailer URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      required
                      name="trailerUrl"
                      value={formData.trailerUrl}
                      placeholder="Trailer URL"
                      className={`${inputBase} pl-10`}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cast & Genre Section */}
            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <label className={labelBase}>Select Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((g: any) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleArrayItem(g.id, "genreIds")}
                      className={`px-4 py-2 rounded-md text-xs font-bold transition-all border ${formData.genreIds.includes(g.id) ? "bg-red-600 border-red-600 text-white" : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500"}`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <label className={labelBase}>Assign Cast</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {actors
                    .filter((a: any) => formData.actorIds.includes(a.id))
                    .map((a: any) => (
                      <div
                        key={a.id}
                        className="bg-red-600/20 border border-red-600/40 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <span className="text-red-400 font-medium">
                          {a.name}
                        </span>
                        <X
                          className="w-4 h-4 cursor-pointer text-red-400"
                          onClick={() => toggleArrayItem(a.id, "actorIds")}
                        />
                      </div>
                    ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    placeholder="Search actors..."
                    className={`${inputBase} pl-10`}
                    value={actorSearch}
                    onChange={(e) => {
                      setActorSearch(e.target.value);
                      setIsActorDropdownOpen(true);
                    }}
                    onFocus={() => setIsActorDropdownOpen(true)}
                    onBlur={() =>
                      setTimeout(() => setIsActorDropdownOpen(false), 200)
                    }
                  />
                  {isActorDropdownOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl max-h-60 overflow-y-auto shadow-2xl custom-scrollbar">
                      {actors
                        .filter((a: any) => {
                          if (!actorSearch.trim()) return true;
                          const terms = actorSearch.toLowerCase().split(/\s+/);
                          return terms.some((term) =>
                            a.name.toLowerCase().includes(term),
                          );
                        })
                        .map((a: any) => (
                          <div
                            key={a.id}
                            onClick={() => toggleArrayItem(a.id, "actorIds")}
                            className="p-3 hover:bg-red-600/10 cursor-pointer flex items-center justify-between border-b border-gray-800 last:border-0"
                          >
                            <span className="text-gray-300">{a.name}</span>
                            {formData.actorIds.includes(a.id) && (
                              <Check className="w-4 h-4 text-red-600" />
                            )}
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

              <div className="space-y-4">
                <div className="group relative border-2 border-dashed border-gray-800 hover:border-red-600/50 rounded-xl p-6 transition-all text-center">
                  <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-red-500" />
                  <p className="text-xs text-gray-500 mb-2 uppercase font-bold">
                    Poster Image
                  </p>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, "poster")}
                  />
                  {posterFile && (
                    <p className="text-xs text-green-500 font-bold truncate">
                      {posterFile.name}
                    </p>
                  )}
                </div>

                <div className="group relative border-2 border-dashed border-gray-800 hover:border-red-600/50 rounded-xl p-6 transition-all text-center">
                  <ImageIcon className="w-8 h-8 text-gray-600 mx-auto mb-2 group-hover:text-red-500" />
                  <p className="text-xs text-gray-500 mb-2 uppercase font-bold">
                    Backdrop Image
                  </p>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, "backdrop")}
                  />
                  {backdropFile && (
                    <p className="text-xs text-green-500 font-bold truncate">
                      {backdropFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#141414] border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
              <label className={labelBase}>Pricing & Status</label>

              <div className="space-y-4">
                <select
                  name="type"
                  className={inputBase}
                  onChange={handleChange}
                  value={formData.type}
                >
                  <option value="MOVIE">Movie</option>
                  <option value="SERIES">Series</option>
                </select>

                <select
                  name="status"
                  className={inputBase}
                  onChange={handleChange}
                  value={formData.status}
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>

                <select
                  name="pricingTier"
                  className={inputBase}
                  onChange={handleChange}
                  value={formData.pricingTier}
                >
                  <option value="PREMIUM">Premium</option>
                  <option value="FREE">Free</option>
                </select>

                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      name="rentPrice"
                      value={formData.rentPrice}
                      type="number"
                      placeholder="Rent"
                      className={`${inputBase} pl-10`}
                      onChange={handleChange}
                      disabled={formData.pricingTier === "FREE"}
                    />
                  </div>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                    <input
                      name="buyPrice"
                      value={formData.buyPrice}
                      type="number"
                      placeholder="Buy"
                      className={`${inputBase} pl-10`}
                      onChange={handleChange}
                      disabled={formData.pricingTier === "FREE"}
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={isLoading}
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? "Publishing..." : "Create Movie"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
