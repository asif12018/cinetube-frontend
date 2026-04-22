"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ThumbsUp, MessageSquare, UserCircle, Loader2, Edit2, X, Check } from "lucide-react"; 
import { toast } from "sonner"; 

import { getMovieReviewByMovieId, updateReview, updateReviewStatus, deleteReview } from "@/service/review.service"; 
import { toggoleLike } from "@/service/like.service"; 
import { createComment } from "@/service/comment.service"; 
import { ConfirmationModal } from "@/components/ui/shared/ConfirmationModal";

function ReviewCard({ review, isAdmin }: { review: any; isAdmin?: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "STATUS" | "DELETE" | null;
    nextStatus: string | null;
  }>({ isOpen: false, action: null, nextStatus: null });
  
  // Like States
  const [isLiked, setIsLiked] = useState(review.isLikedByCurrentUser || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [likeCount, setLikeCount] = useState(review._count?.likes || review.likesCount || 0);

  // Comment States
  const [commentText, setCommentText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content);
  
  const queryClient = useQueryClient();

  const formattedDate = new Date(review.publishedAt || review.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });

  // --- MUTATIONS & HANDLERS ---

  const handleToggleLike = async () => {
    if (isLikeLoading) return;
    try {
      setIsLikeLoading(true);
      
      // Optimistic Update
      setIsLiked(!isLiked); 
      setLikeCount((prev: number) => isLiked ? Math.max(0, prev - 1) : prev + 1);

      const res = await toggoleLike(review.id);
      
      if (!res?.success) {
        setIsLiked(!isLiked); 
        setLikeCount((prev: number) => !isLiked ? Math.max(0, prev - 1) : prev + 1);
        toast.error("Failed to update like status.");
      }
    } catch (error) {
      setIsLiked(!isLiked); 
      setLikeCount((prev: number) => !isLiked ? Math.max(0, prev - 1) : prev + 1);
      toast.error("Something went wrong while liking.");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const { mutate: submitComment, isPending: isCommenting } = useMutation({
    mutationFn: () => createComment(review.id, commentText),
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText(""); 
      queryClient.invalidateQueries({ queryKey: ["movie-reviews"] }); 
    },
    onError: () => {
      toast.error("Failed to add comment.");
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    submitComment();
  };

  const handleReplyClick = (userName: string) => {
    setCommentText(`@${userName} `);
    inputRef.current?.focus();
  };

  const { mutate: submitEdit, isPending: isUpdating } = useMutation({
    mutationFn: () => updateReview(review.id, editContent),
    onSuccess: (res) => {
      if (res?.success !== false) { 
        toast.success("Review updated successfully!");
        setIsEditing(false);
        queryClient.invalidateQueries({ queryKey: ["movie-reviews"] }); 
      } else {
        toast.error(res?.message || "Failed to update review.");
      }
    },
    onError: () => {
      toast.error("An error occurred while updating.");
    }
  });

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    submitEdit();
  };

  // ADMIN MUTATIONS
  const statusMutation = useMutation({
    mutationFn: (status: string) => updateReviewStatus(review.id, status),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to update review status");
      } else {
        toast.success("Review status updated successfully");
        queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
        setModalState({ isOpen: false, action: null, nextStatus: null });
      }
    },
    onError: () => {
      toast.error("Failed to update review status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReview(review.id),
    onSuccess: (data) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to delete review");
      } else {
        toast.success("Review deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
        setModalState({ isOpen: false, action: null, nextStatus: null });
      }
    },
    onError: () => {
      toast.error("Failed to delete review");
    }
  });

  const getContainerStyles = () => {
    if (review.status === "UNPUBLISHED") {
      return "border-red-500/30 bg-red-500/5 hover:bg-red-500/10";
    }
    if (review.status === "PENDING") {
      return "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10";
    }
    return "border-white/10 bg-white/5 hover:bg-white/10";
  };

  return (
    <div className={`backdrop-blur-md border rounded-xl p-5 md:p-6 transition-all ${getContainerStyles()}`}>
      
      {/* 🟢 HEADER: User info and Rating */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <UserCircle className="w-10 h-10 text-gray-400" />
          <div>
            <p className="font-semibold text-gray-200 flex items-center gap-2">
              {review.user?.name || "CineHub User"}
              
              {/* DYNAMIC STATUS BADGE */}
              {review.status !== "PUBLISHED" && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                  review.status === "UNPUBLISHED" 
                    ? "bg-red-500/10 text-red-500 border-red-500/20" 
                    : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                }`}>
                  {review.status === "UNPUBLISHED" ? "Unpublished" : "Pending Approval"}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
        
        {/* Rating Badge & Action Container */}
        <div className="flex items-center gap-3">
          
          {/* ADMIN ACTIONS */}
          {isAdmin && (
            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={() => {
                  const nextStatus = review.status === "PUBLISHED" ? "UNPUBLISHED" : "PUBLISHED";
                  setModalState({ isOpen: true, action: "STATUS", nextStatus });
                }}
                disabled={statusMutation.isPending}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  review.status === "PUBLISHED" 
                    ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20"
                    : "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                }`}
              >
                {statusMutation.isPending ? "..." : review.status === "PUBLISHED" ? "Unpublish" : "Approve"}
              </button>
              <button
                onClick={() => {
                  setModalState({ isOpen: true, action: "DELETE", nextStatus: null });
                }}
                disabled={deleteMutation.isPending}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                {deleteMutation.isPending ? "..." : "Delete"}
              </button>
            </div>
          )}

          {/* EDIT BUTTON */}
          {review.isOwner && review.status !== "PUBLISHED" && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Edit Review"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20 shadow-inner">
            <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-500 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-sm md:text-base">
              {review.rating}
              <span className="text-yellow-500/60 font-medium text-xs md:text-sm">/10</span>
            </span>
          </div>
        </div>
      </div>

      {/* 🟢 BODY: Review Content or Edit Form */}
      <div className={`${review.status === "PUBLISHED" ? "mb-6" : "mb-0"}`}>
        {isEditing ? (
          // EDIT MODE UI
          <div className="space-y-3 animate-in fade-in">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-black/40 border border-gray-600 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-red-500 min-h-[100px]"
              disabled={isUpdating}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(review.content); 
                }}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={isUpdating || !editContent.trim()}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          // NORMAL VIEW MODE
          <>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              {review.content}
            </p>
            {review.tags && review.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {review.tags.map((t: any) => (
                  <span key={t.tag.id} className="text-xs px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    {t.tag.name}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 🟢 FOOTER: Actions - ONLY SHOWN IF REVIEW IS PUBLISHED */}
      {review.status === "PUBLISHED" && (
        <div className="flex items-center gap-6 border-t border-gray-700/50 pt-4">
          <button 
            onClick={handleToggleLike}
            disabled={isLikeLoading}
            className={`flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLiked ? "text-blue-400" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 transition-all ${isLiked ? "fill-current scale-110" : ""}`} /> 
            {likeCount > 0 ? `${likeCount} ` : "Like"}
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4" /> 
            {review.comments?.length || 0} Comments
          </button>
        </div>
      )}

      {/* 🟢 COMMENTS SECTION - ONLY SHOWN IF PUBLISHED */}
      {review.status === "PUBLISHED" && showComments && (
        <div className="mt-6 space-y-4 pl-4 md:pl-6 border-l-2 border-gray-700/50 animate-in fade-in slide-in-from-top-4 duration-300">
          
          {/* List Existing Comments */}
          {review.comments && review.comments.length > 0 ? (
            review.comments.map((comment: any) => (
              <div key={comment.id} className="bg-black/20 rounded-lg p-4 border border-white/5 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300">
                      {comment.user?.name?.charAt(0) || "U"}
                    </div>
                    <p className="text-sm font-medium text-gray-300">{comment.user?.name || "User"}</p>
                    <span className="text-[10px] text-gray-500">•</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  
                  {/* Reply Button */}
                  <button 
                    onClick={() => handleReplyClick(comment.user?.name || "User")}
                    className="text-xs text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Reply
                  </button>
                </div>
                
                {/* Highlight mentions in blue */}
                <p className="text-sm text-gray-400 pl-8">
                  {comment.content.split(' ').map((word: string, i: number) => 
                    word.startsWith('@') ? (
                      <span key={i} className="text-blue-400 font-medium">{word} </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic mb-4">No comments yet. Be the first to share your thoughts!</p>
          )}

          {/* New Comment Input Form */}
          <form onSubmit={handleCommentSubmit} className="mt-4 flex gap-2 pt-2">
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment or reply..."
              disabled={isCommenting}
              className="flex-1 bg-black/40 border border-gray-700 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isCommenting || !commentText.trim()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCommenting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </button>
          </form>

        </div>
      )}

      {/* ADMIN ACTION CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, nextStatus: null })}
        onConfirm={() => {
          if (modalState.action === "STATUS" && modalState.nextStatus) {
            statusMutation.mutate(modalState.nextStatus);
          } else if (modalState.action === "DELETE") {
            deleteMutation.mutate();
          }
        }}
        isPending={statusMutation.isPending || deleteMutation.isPending}
        title={
          modalState.action === "DELETE" 
            ? "Delete Review?" 
            : modalState.nextStatus === "PUBLISHED" 
              ? "Approve Review?" 
              : "Unpublish Review?"
        }
        message={
          modalState.action === "DELETE"
            ? "Are you sure you want to permanently delete this review? This action cannot be undone."
            : modalState.nextStatus === "PUBLISHED"
              ? "Are you sure you want to approve and publish this review? It will be visible to all users."
              : "Are you sure you want to unpublish this review? It will be hidden from public view."
        }
        confirmText={
          modalState.action === "DELETE" 
            ? "Yes, Delete" 
            : modalState.nextStatus === "PUBLISHED" 
              ? "Yes, Approve" 
              : "Yes, Unpublish"
        }
        cancelText="Cancel"
        variant={
          modalState.action === "DELETE" 
            ? "danger" 
            : modalState.nextStatus === "PUBLISHED" 
              ? "success" 
              : "warning"
        }
      />
    </div>
  );
}

// Main Component exported to your page
export default function ReviewElement({ movieId, isAdmin }: { movieId: string; isAdmin?: boolean }) {
  const { data: response, isLoading, isError } = useQuery<any>({
    queryKey: ["movie-reviews", movieId],
    queryFn: () => getMovieReviewByMovieId(movieId),
    enabled: !!movieId, 
  });

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
            <ReviewCard key={review.id} review={review} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}