"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ThumbsUp, MessageSquare, UserCircle, Loader2 } from "lucide-react";
// 🟢 Import your service! Adjust the path if needed.
import { getMovieReviewByMovieId } from "@/service/review.service"; 

// Sub-component for individual reviews to handle its own "show comments" state
function ReviewCard({ review }: { review: any }) {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false); // Placeholder for future like functionality

  // Format date safely
  const formattedDate = new Date(review.publishedAt || review.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 md:p-6 transition-all hover:bg-white/10">
      
      {/* HEADER: User info and Rating */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserCircle className="w-10 h-10 text-gray-400" />
          <div>
            <p className="font-semibold text-gray-200">
              {review.user?.name || "CineHub User"}
            </p>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 md:w-5 md:h-5 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-600"}`} 
            />
          ))}
        </div>
      </div>

      {/* BODY: Review Content & Tags */}
      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {review.content}
        </p>
        
        {/* Render Tags if they exist */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {review.tags.map((t: any) => (
              <span key={t.tag.id} className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {t.tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER: Actions */}
      <div className="flex items-center gap-6 border-t border-gray-700/50 pt-4">
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? "text-blue-400" : "text-gray-400 hover:text-gray-200"}`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} /> 
          Like
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          <MessageSquare className="w-4 h-4" /> 
          {review.comments?.length || 0} Comments
        </button>
      </div>

      {/* COMMENTS SECTION (Toggled) */}
      {showComments && review.comments && review.comments.length > 0 && (
        <div className="mt-6 space-y-4 pl-4 md:pl-6 border-l-2 border-gray-700/50 animate-in fade-in slide-in-from-top-4 duration-300">
          {review.comments.map((comment: any) => (
            <div key={comment.id} className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300">
                  {comment.user?.name?.charAt(0) || "U"}
                </div>
                <p className="text-sm font-medium text-gray-300">{comment.user?.name || "User"}</p>
                <span className="text-[10px] text-gray-500">•</span>
                <span className="text-[10px] text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-400 pl-8">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component exported to your page
export default function ReviewElement({ movieId }: { movieId: string }) {
  // Fetch reviews using React Query
  const { data: response, isLoading, isError } = useQuery<any>({
    queryKey: ["movie-reviews", movieId],
    queryFn: () => getMovieReviewByMovieId(movieId),
    enabled: !!movieId, // Only run if movieId is provided
  });

  // Extract the array of reviews safely
  const reviews = response?.data || response || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-400 text-center py-8">Failed to load reviews.</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 px-4 md:px-12 pb-24">
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">
        Audience Reviews <span className="text-gray-500 text-lg font-normal">({reviews.length})</span>
      </h2>
      
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/5 text-gray-400">
          No reviews yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review: any) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}