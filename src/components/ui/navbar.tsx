"use client";

import { useState, useEffect } from "react";
// 🟢 NEW: Imported Shield for the Admin Badge!
import {
  Search,
  User,
  Loader2,
  Sparkles,
  Crown,
  LogOut,
  ListVideo,
  ShoppingBag,
  CreditCard,
  Shield,
  Bell,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getUserInfo, logoutUserAction } from "@/service/auth.service";
import { getMedia } from "@/service/media.service";
import { getSubscriptionInfo } from "@/service/payment.service";
import {
  getAllUserNotification,
  readNotification,
} from "@/service/notification.service";

export function Navbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // 1. Fetch User Info
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: getUserInfo,
  });

  // 2. Fetch Subscription Info
  const { data: subResponse, isLoading: isLoadingSub } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: getSubscriptionInfo,
    enabled: !!user,
  });

  const isSetToCancel =
    subResponse?.cancelAtPeriodEnd === true ||
    subResponse?.data?.cancelAtPeriodEnd === true ||
    subResponse?.data?.data?.cancelAtPeriodEnd === true;

  const isSubscribed =
    isSetToCancel ||
    subResponse === true ||
    subResponse?.data === true ||
    subResponse?.success === true ||
    // Direct status at root
    subResponse?.status === "ACTIVE" ||
    // Nested one level: { data: { status: "ACTIVE" } }
    subResponse?.data?.status === "ACTIVE" ||
    // Nested two levels: { data: { data: { status: "ACTIVE" } } }
    subResponse?.data?.data?.status === "ACTIVE";

  // 🟢 NEW: Clean Admin Check
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // Fetch Notifications
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: getAllUserNotification,
    enabled: !!user,
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const notifications = Array.isArray(notificationsData)
    ? notificationsData
    : notificationsData?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const { mutate: markAsRead, isPending: isMarkingRead } = useMutation({
    mutationFn: readNotification,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications", user?.id] });
      const previousNotifications = queryClient.getQueryData(["notifications", user?.id]);
      
      // Optimistically update notifications to be marked as read
      queryClient.setQueryData(["notifications", user?.id], (old: any) => {
        if (!old) return old;
        const oldData = Array.isArray(old) ? old : old.data || [];
        const newData = oldData.map((n: any) => ({ ...n, isRead: true }));
        return Array.isArray(old) ? newData : { ...old, data: newData };
      });
      
      return { previousNotifications };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      toast.success("Notification marked as read");
    },
    onError: (error: any, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", user?.id], context.previousNotifications);
      }
      toast.error(error?.response?.data?.message || "Failed to mark as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
    }
  });

  // 3. Fetch Search Results
  const { data: searchResults, isLoading: isSearching } = useQuery<any>({
    queryKey: ["search-media", searchTerm],
    queryFn: () => getMedia(`searchTerm=${searchTerm}`),
    enabled: searchTerm.trim().length > 1,
  });

  const suggestions = searchResults?.data?.data || searchResults?.data || [];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const res = await logoutUserAction();

      if (res.success) {
        toast.success("Logged out successfully");
        queryClient.setQueryData(["user"], null);
        queryClient.removeQueries({ queryKey: ["user"] });
        queryClient.removeQueries({ queryKey: ["subscription"] });

        setIsProfileOpen(false);
        router.push("/login");
      } else {
        toast.error("Failed to log out");
      }
    } catch (error) {
      toast.error("An error occurred during logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchTerm.trim()) {
      setShowSuggestions(false);
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
      setIsProfileOpen(false);
      setIsNotificationOpen(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-b from-black/90 to-transparent p-4 md:p-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent shrink-0 tracking-tight"
        >
          CineHub
        </Link>

        {/* Search Section */}
        <div
          className="hidden md:flex flex-1 max-w-md mx-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <button
              type="submit"
              className="absolute left-4 top-1/2 transform -translate-y-1/2"
            >
              <Search className="text-gray-400 w-5 h-5 group-hover:text-red-500 transition-colors cursor-pointer" />
            </button>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search movies..."
              className="w-full pl-12 pr-10 py-2 bg-[#141414]/80 backdrop-blur-sm border border-gray-700/50 rounded-full text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-gray-500"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-red-600" />
            )}
          </form>

          {showSuggestions && searchTerm.trim().length > 1 && (
            <div className="absolute top-full mt-2 w-full bg-[#141414] border border-gray-800 rounded-lg shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
              {suggestions.length > 0
                ? suggestions.map((movie: any) => (
                    <Link
                      key={movie.id}
                      href={`/media/${movie.id}`}
                      onClick={() => {
                        setShowSuggestions(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors border-b border-gray-800/50 last:border-0"
                    >
                      <div className="relative w-12 h-16 shrink-0 bg-gray-900 rounded">
                        <Image
                          src={movie.posterUrl || "/placeholder.jpg"}
                          alt={movie.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm line-clamp-1">
                          {movie.title}
                        </span>
                        <span className="text-gray-400 text-xs mt-0.5">
                          {movie.releaseYear} • {movie.type}
                        </span>
                      </div>
                    </Link>
                  ))
                : !isSearching && (
                    <div className="p-4 text-gray-400 text-sm text-center">
                      No movies found.
                    </div>
                  )}
            </div>
          )}
        </div>

        {/* User Options Section */}
        <div className="flex items-center space-x-4 md:space-x-6 shrink-0">
          <button className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <Search className="w-5 h-5 text-white" />
          </button>

          {user?.role === "USER" && (
            <Link
              href="/movie"
              className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Movie
            </Link>
          )}

          {isAdmin && (
            <Link
              href="/dashboard"
              className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          )}

          {/* Conditional Auth UI */}
          {isLoadingUser || (user && isLoadingSub) ? (
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-gray-700 border-t-red-600 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-3 md:gap-4">
              {/* 🟢 BADGE LOGIC: Admin > Subscribed > Unsubscribed */}
              {isAdmin ? (
                <div className="hidden sm:flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-1 rounded-md text-xs font-bold border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                  <Shield className="w-3.5 h-3.5" />
                  ADMIN
                </div>
              ) : !isSubscribed ? (
                <Link
                  href="/pricing"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-3 py-1.5 md:px-4 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all shadow-[0_0_10px_rgba(234,179,8,0.2)] hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                  <span className="sm:hidden">Pro</span>
                </Link>
              ) : (
                <div className="hidden sm:flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md text-xs font-bold border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                  <Crown className="w-3.5 h-3.5" />
                  PRO
                </div>
              )}

              {/* Notifications Wrapper */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsProfileOpen(false);
                  }}
                  className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                >
                  <Bell className="w-5 h-5 md:w-6 md:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-full mt-3 w-80 bg-[#141414] border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col z-50">
                    <div className="px-4 py-3 border-b border-gray-800 bg-white/5 flex justify-between items-center">
                      <p className="text-sm font-medium text-white">
                        Notifications
                      </p>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAsRead()}
                          disabled={isMarkingRead}
                          className="text-xs text-red-500 hover:text-red-400 font-medium disabled:opacity-50"
                        >
                          {isMarkingRead ? "Marking..." : "Mark as read"}
                        </button>
                      )}
                    </div>

                    <div className="max-h-[350px] overflow-y-auto flex flex-col custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif: any) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setIsNotificationOpen(false);
                              if (notif.link) {
                                if (notif.link.startsWith("/profile")) {
                                  toast.info(
                                    "User profile view is coming soon!",
                                  );
                                } else {
                                  router.push(notif.link);
                                }
                              }
                            }}
                            className={`p-4 border-b border-gray-800/50 last:border-0 hover:bg-white/10 transition-colors ${notif.link ? "cursor-pointer" : ""} ${notif.isRead ? "opacity-70" : "bg-red-500/5"}`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${notif.isRead ? "text-gray-300" : "text-white font-medium"}`}
                                >
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                  {notif.body}
                                  <br />
                                  <span className="text-red-500">
                                    {/* {JSON.stringify(notif)} */}
                                  </span>
                                </p>
                                <p className="text-[10px] text-gray-500 mt-2 font-medium">
                                  {new Date(notif.createdAt).toLocaleDateString(
                                    undefined,
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                          <Bell className="w-8 h-8 mb-2 opacity-20" />
                          <span className="text-sm">No notifications yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown Wrapper */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                {/* Avatar */}
                <div
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationOpen(false);
                  }}
                  className={`relative overflow-hidden w-9 h-9 md:w-10 md:h-10 border rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isAdmin
                      ? "border-red-500 bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      : isSubscribed
                        ? "border-yellow-500 bg-yellow-500/10 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                        : "bg-gray-800 border-gray-700 hover:border-red-500 hover:bg-red-600/20"
                  }`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Profile"}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User
                      className={`w-5 h-5 md:w-6 md:h-6 ${isAdmin ? "text-red-500" : isSubscribed ? "text-yellow-500" : "text-gray-300"}`}
                    />
                  )}
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 bg-[#141414] border border-gray-800 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 flex flex-col z-50">
                    <div className="px-4 py-3 border-b border-gray-800 bg-white/5">
                      <p className="text-sm font-medium text-white truncate">
                        {user.name || "CineHub User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-2 flex flex-col gap-1">
                      <Link
                        href="/watchList"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      >
                        <ListVideo className="w-4 h-4 text-gray-400" />
                        Watchlist
                      </Link>

                      {/* 🟢 HIDE PAYMENT/SUBSCRIPTION LINKS FOR ADMINS */}
                      {!isAdmin && (
                        <>
                          <Link
                            href="/payment-history"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            Purchase History
                          </Link>

                          <Link
                            href="/pricing"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          >
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            Manage Subscription
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="p-2 border-t border-gray-800">
                      <button
                        onClick={() => handleLogout()}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 md:py-2 rounded-md text-sm font-medium transition-all shadow-md hover:shadow-red-600/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
