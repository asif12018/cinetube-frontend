"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfo, updateUserProfile } from "@/service/auth.service";
import { User, Mail, Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUserInfo,
  });

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        gender: user.gender || "MALE", // Default or current
      });
      setPreviewImage(user.image || null);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!user?.id) throw new Error("User ID is missing");
      
      const res = await updateUserProfile(user.id, data);

      if (!res.success) {
        throw new Error(res.message || "Failed to update profile");
      }

      return res.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setSelectedFile(null); // Reset file selection state
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("gender", formData.gender);
    if (selectedFile) {
      submitData.append("image", selectedFile);
    }

    updateProfileMutation.mutate(submitData);
  };

  // Prevent hydration mismatch by returning a skeleton/loading state matching the client
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-card w-full">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="bg-card min-h-screen w-full text-foreground font-sans p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">Edit Profile</h1>

        <div className="bg-background border border-border rounded-2xl p-6 md:p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-8">
              <div className="relative group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-muted border-2 border-border relative">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-full h-full p-6 text-gray-500" />
                  )}
                  
                  {/* Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="flex flex-col justify-center pt-2 text-center sm:text-left">
                <h3 className="text-lg font-semibold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-red-500 hover:text-red-400 font-medium"
                >
                  Upload new picture
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-muted/50 border border-border rounded-lg py-2.5 pl-10 pr-4 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg py-2.5 px-4 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

            </div>

            <div className="pt-6 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
