"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquareWarning, CheckCircle, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { getUnPublishedReviews, updateReviewStatus, deleteReview } from "@/service/review.service";
import { ConfirmationModal } from "@/components/ui/shared/ConfirmationModal";

export default function PendingReviewsPage() {
  const queryClient = useQueryClient();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "APPROVE" | "REJECT" | null;
    reviewId: string | null;
  }>({ isOpen: false, action: null, reviewId: null });

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-pending-reviews"],
    queryFn: () => getUnPublishedReviews()
  });

  // Extract the reviews array (handles different possible wrapper structures)
  const reviews = response?.data || response || [];

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateReviewStatus(id, status),
    onSuccess: (data, variables) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to update review status");
      } else {
        toast.success("Review status updated successfully");
        setModalState({ isOpen: false, action: null, reviewId: null });
        
        // Optimistically remove from list so UI updates instantly
        queryClient.setQueryData(["admin-pending-reviews"], (oldData: any) => {
          if (!oldData) return oldData;
          const filterFn = (r: any) => r.id !== variables.id;
          if (Array.isArray(oldData)) return oldData.filter(filterFn);
          if (oldData.data && Array.isArray(oldData.data)) return { ...oldData, data: oldData.data.filter(filterFn) };
          return oldData;
        });
        
        queryClient.invalidateQueries({ queryKey: ["admin-pending-reviews"] });
      }
    },
    onError: () => {
      toast.error("Failed to update review status");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: (data, variables) => {
      if (data?.success === false) {
        toast.error(data.message || "Failed to delete review");
      } else {
        toast.success("Review deleted successfully");
        setModalState({ isOpen: false, action: null, reviewId: null });

        // Optimistically remove from list so UI updates instantly
        queryClient.setQueryData(["admin-pending-reviews"], (oldData: any) => {
          if (!oldData) return oldData;
          const filterFn = (r: any) => r.id !== variables;
          if (Array.isArray(oldData)) return oldData.filter(filterFn);
          if (oldData.data && Array.isArray(oldData.data)) return { ...oldData, data: oldData.data.filter(filterFn) };
          return oldData;
        });

        queryClient.invalidateQueries({ queryKey: ["admin-pending-reviews"] });
      }
    },
    onError: () => {
      toast.error("Failed to delete review");
    }
  });

  const handleApprove = (id: string) => {
    setModalState({ isOpen: true, action: "APPROVE", reviewId: id });
  };

  const handleReject = (id: string) => {
    setModalState({ isOpen: true, action: "REJECT", reviewId: id });
  };

  const handleConfirmAction = () => {
    if (!modalState.reviewId) return;
    
    if (modalState.action === "APPROVE") {
      statusMutation.mutate({ id: modalState.reviewId, status: "PUBLISHED" });
    } else if (modalState.action === "REJECT") {
      deleteMutation.mutate(modalState.reviewId);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-[#0a0a0a] p-4 md:p-8 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <MessageSquareWarning className="w-8 h-8 text-yellow-500" />
              Pending Reviews
            </h1>
            <p className="text-gray-400 mt-2">Manage user reviews awaiting moderation.</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#1a1a1a] text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Review Content</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-yellow-500 rounded-full animate-spin" />
                        Loading reviews...
                      </div>
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <MessageSquareWarning className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending reviews found. You're all caught up!</p>
                    </td>
                  </tr>
                ) : (
                  reviews.map((review: any) => (
                    <tr key={review.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{review.user?.name || "Unknown User"}</span>
                          <span className="text-xs text-gray-500">{review.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <p className="truncate text-gray-300" title={review.content}>
                          {review.content || "No text provided"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500 font-bold">{review.rating}</span>
                          <span className="text-gray-500 text-xs">/ 10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-600/20 text-yellow-400">
                          {review.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleApprove(review.id)}
                            disabled={statusMutation.isPending}
                            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Approve & Publish"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleReject(review.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Reject & Delete"
                          >
                            <Trash2 className="w-5 h-5" />
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null, reviewId: null })}
        onConfirm={handleConfirmAction}
        isPending={statusMutation.isPending || deleteMutation.isPending}
        title={modalState.action === "APPROVE" ? "Approve Review?" : "Reject Review?"}
        message={
          modalState.action === "APPROVE" 
            ? "Are you sure you want to approve and publish this review? It will be visible to all users."
            : "Are you sure you want to permanently delete this pending review? This action cannot be undone."
        }
        confirmText={modalState.action === "APPROVE" ? "Yes, Approve" : "Yes, Reject"}
        cancelText="Cancel"
        variant={modalState.action === "APPROVE" ? "success" : "danger"}
      />
    </div>
  );
}
