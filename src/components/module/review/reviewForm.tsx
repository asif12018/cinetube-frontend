"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";

import { createReview } from "@/service/review.service";
import { getAllTags } from "@/service/tags.service";

export default function CreateReviewForm({ movieId }: { movieId: string }) {
  const queryClient = useQueryClient();
  
  // Form State
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSpoiler, setIsSpoiler] = useState(false);
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch Tags
  const { data: tagsResponse, isLoading: isLoadingTags } = useQuery<any>({
    queryKey: ["tags"],
    queryFn: getAllTags,
  });

  const tags = tagsResponse?.data || tagsResponse || [];

  // Toggle Tag Selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => 
      prev.includes(tagId) 
        ? prev.filter((id) => id !== tagId) // Remove if already selected
        : [...prev, tagId] // Add if not selected
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating!");
      return;
    }
    if (content.trim().length < 10) {
      toast.error("Review must be at least 10 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        rating,
        content,
        tags: selectedTags,
        isSpoiler
      };

      const res:any = await createReview(payload, movieId);
      
      // 🚨 DEBUG: This will show you exactly what your API returned in the browser console
      console.log("RAW CREATE REVIEW RESPONSE:", res);

      // 🟢 BULLETPROOF SUCCESS CHECK
      // It now checks if 'success' is true OR if the backend returned the new review's 'id'
      const isSuccess = 
        res?.success === true || 
        res?.data?.success === true || 
        res?.id !== undefined || 
        res?.data?.id !== undefined ||
        (res && res.error === undefined && res.success !== false);

      if (isSuccess) {
        toast.success("Review posted successfully!");
        
        // 🟢 THIS IS THE CODE THAT RESETS THE FORM
        setRating(0);
        setHoveredRating(0);
        setContent("");
        setSelectedTags([]);
        setIsSpoiler(false);
        setIsDropdownOpen(false);

        
        
        // 🟢 Tell React Query to instantly refresh the reviews list!
        queryClient.invalidateQueries({ queryKey: ["movie-reviews", movieId] });

        // 🟢 2. ADD THIS LINE: Tells the parent page to re-check if the user reviewed it!
        queryClient.invalidateQueries({ queryKey: ["user-review-check", movieId] });
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to post review.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 md:p-6 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* RATING STARS */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
          <div className="flex gap-1" onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <Star
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-600 hover:text-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* TEXT AREA */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Your Review</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What did you think of the movie?"
            className="w-full bg-black/40 border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-red-500 min-h-[120px] transition-colors resize-y"
          />
        </div>

        {/* SPOILER CHECKBOX */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isSpoiler"
            checked={isSpoiler}
            onChange={(e) => setIsSpoiler(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-black/40 text-red-600 focus:ring-red-600"
          />
          <label htmlFor="isSpoiler" className="text-sm font-medium text-red-400 cursor-pointer select-none">
            This review contains spoilers
          </label>
        </div>

        {/* TAGS DROPDOWN */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">Tags (Optional)</label>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between bg-black/40 border border-gray-700 rounded-md p-3 text-left text-gray-300 hover:border-gray-500 transition-colors"
          >
            <span>
              {selectedTags.length > 0 
                ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected` 
                : "Select tags..."}
            </span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-md shadow-2xl max-h-60 overflow-y-auto">
              {isLoadingTags ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading tags...</div>
              ) : (
                <div className="p-2 space-y-1">
                  {tags.map((tag: any) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <div
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-red-600/20 text-red-400" : "hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                          isSelected ? "border-red-500 bg-red-500" : "border-gray-500"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm">{tag.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-md font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Posting..." : "Post Review"}
          </button>
        </div>

      </form>
    </div>
  );
}