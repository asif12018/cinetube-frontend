"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllActors, createActor, updateActor, deleteActor } from "@/service/actor.service";
import { Plus, Edit, Trash2, X, Search, Image as ImageIcon, Loader2, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type ActorModalMode = "CREATE" | "EDIT" | null;

export default function ManageActorsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<ActorModalMode>(null);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);
  const [actorToDelete, setActorToDelete] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);

  // Fetch Actors
  const { data: actors = [], isLoading } = useQuery({
    queryKey: ["admin-actors"],
    queryFn: () => getAllActors(),
  });

  // Filter Actors based on search
  const filteredActors = actors.filter((actor: any) => 
    actor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormData) => createActor(data),
    onSuccess: () => {
      toast.success("Actor created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["admin-actors"] });
      queryClient.invalidateQueries({ queryKey: ["actors"] });
      closeModal();
    },
    onError: () => toast.error("Failed to create actor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => updateActor(id, data),
    onSuccess: () => {
      toast.success("Actor updated successfully! ✨");
      queryClient.invalidateQueries({ queryKey: ["admin-actors"] });
      queryClient.invalidateQueries({ queryKey: ["actors"] });
      closeModal();
    },
    onError: () => toast.error("Failed to update actor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActor(id),
    onSuccess: () => {
      toast.success("Actor deleted successfully! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["admin-actors"] });
      queryClient.invalidateQueries({ queryKey: ["actors"] });
      setActorToDelete(null);
    },
    onError: () => toast.error("Failed to delete actor"),
  });

  // Handlers
  const handleOpenCreateModal = () => {
    setName("");
    setPhotoFile(null);
    setExistingPhotoUrl(null);
    setSelectedActorId(null);
    setModalMode("CREATE");
  };

  const handleOpenEditModal = (actor: any) => {
    setName(actor.name);
    setExistingPhotoUrl(actor.photoUrl || null);
    setPhotoFile(null);
    setSelectedActorId(actor.id);
    setModalMode("EDIT");
  };

  const closeModal = () => {
    setModalMode(null);
  };

  const confirmDelete = () => {
    if (actorToDelete) {
      deleteMutation.mutate(actorToDelete.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return toast.error("Name is required");
    }

    if (modalMode === "CREATE" && !photoFile) {
      return toast.error("Photo is required to create a new actor");
    }

    const formData = new FormData();
    formData.append("name", name);
    if (photoFile) {
      formData.append("photoUrl", photoFile);
    }

    if (modalMode === "CREATE") {
      createMutation.mutate(formData);
    } else if (modalMode === "EDIT" && selectedActorId) {
      updateMutation.mutate({ id: selectedActorId, data: formData });
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen w-full flex-1 bg-[#0a0a0a] p-4 md:p-8 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Manage Actors</h1>
            <p className="text-gray-400 mt-2">Add, update, or remove cast members.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search actors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all w-full md:w-64"
              />
            </div>
            <button 
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Add Actor
            </button>
          </div>
        </div>

        {/* Content Section (Grid) */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
             <div className="w-8 h-8 border-4 border-gray-600 border-t-red-600 rounded-full animate-spin mr-3" />
             Loading actors...
          </div>
        ) : filteredActors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 border border-gray-800 rounded-2xl bg-[#141414]">
             <User className="w-16 h-16 mb-4 opacity-30" />
             <p className="text-lg">No actors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredActors.map((actor: any) => (
              <div key={actor.id} className="bg-[#141414] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all group relative shadow-lg">
                 
                 <div className="aspect-[3/4] bg-gray-800 relative">
                   {actor.photoUrl ? (
                     <Image src={actor.photoUrl} alt={actor.name} fill className="object-cover" />
                   ) : (
                     <User className="w-12 h-12 m-auto text-gray-600 absolute inset-0" />
                   )}
                   
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                     <button 
                       onClick={() => handleOpenEditModal(actor)}
                       className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                       title="Edit Actor"
                     >
                       <Edit className="w-5 h-5" />
                     </button>
                     <button 
                       onClick={() => setActorToDelete({ id: actor.id, name: actor.name })}
                       disabled={deleteMutation.isPending}
                       className="p-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
                       title="Delete Actor"
                     >
                       <Trash2 className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
                 
                 <div className="p-3 text-center border-t border-gray-800">
                    <p className="font-bold text-sm text-gray-200 truncate" title={actor.name}>{actor.name}</p>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === "CREATE" ? "Add New Actor" : "Edit Actor"}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Actor Name</label>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Leonardo DiCaprio"
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Actor Photo</label>
                
                <div className="group relative border-2 border-dashed border-gray-800 hover:border-red-600/50 rounded-xl p-6 transition-all text-center">
                  
                  {existingPhotoUrl && !photoFile && (
                    <div className="mb-4 flex justify-center">
                      <Image src={existingPhotoUrl} alt="Preview" width={80} height={80} className="rounded-full object-cover w-20 h-20 border-2 border-gray-700" />
                    </div>
                  )}

                  {!existingPhotoUrl && !photoFile && (
                    <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2 group-hover:text-red-500 transition-colors" />
                  )}

                  <p className="text-xs text-gray-500 mb-2 font-bold uppercase">
                    {existingPhotoUrl && !photoFile ? "Replace Photo" : "Upload Photo"}
                  </p>
                  
                  <input 
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Image size must be less than 2MB");
                          e.target.value = '';
                          setPhotoFile(null);
                          return;
                        }
                        if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
                          toast.error("Only .jpg, .jpeg, .png formats are supported");
                          e.target.value = '';
                          setPhotoFile(null);
                          return;
                        }
                        setPhotoFile(file);
                      } else {
                        setPhotoFile(null);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                  
                  {photoFile && <p className="text-xs text-green-500 font-bold truncate mt-2">{photoFile.name}</p>}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold tracking-wide transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isMutating}
                  className="flex-[2] bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold tracking-wide shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {modalMode === "CREATE" ? "Save Actor" : "Update Actor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {actorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
             <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-600/30">
                <AlertTriangle className="w-8 h-8 text-red-500" />
             </div>
             
             <h2 className="text-2xl font-bold text-white mb-2">Delete Actor?</h2>
             <p className="text-gray-400 mb-8">
               Are you sure you want to permanently delete <span className="font-bold text-white">"{actorToDelete.name}"</span>? This action cannot be undone.
             </p>
             
             <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setActorToDelete(null)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold tracking-wide transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold tracking-wide shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
