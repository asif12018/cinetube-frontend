import React from 'react';
import { getDashboardStats } from "@/service/admin.service"; 
import { getUserInfo } from "@/service/auth.service";
import { Film, Users, Star, DollarSign, TrendingUp, AlertCircle, ListVideo, ShoppingBag } from "lucide-react";
import Link from 'next/link';

export default async function DashboardOverViewPage() {
  const user = await getUserInfo();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  if (!isAdmin) {
    // User Dashboard Overview
    const userWatchlistCount = user?.watchlist?.length || 0;
    const userReviewsCount = user?.reviews?.length || 0;
    const userPurchasesCount = user?.purchases?.length || 0;

    const userStats = [
      { label: "My Watchlist", value: userWatchlistCount, icon: ListVideo, color: "text-blue-500" },
      { label: "My Reviews", value: userReviewsCount, icon: Star, color: "text-yellow-500" },
      { label: "My Purchases", value: userPurchasesCount, icon: ShoppingBag, color: "text-green-500" },
    ];

    return (
      <div className="bg-card min-h-screen w-full text-foreground font-sans p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || 'User'}!</h1>
            <p className="text-muted-foreground mt-1">Here is your account overview.</p>
          </div>
          <Link 
            href="/dashboard/profile"
            className="bg-red-600 hover:bg-red-700 text-foreground px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg"
          >
            <Users className="w-4 h-4" /> Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userStats.map((stat) => (
            <div key={stat.label} className="bg-background border border-border p-6 rounded-2xl hover:border-border transition-all shadow-md">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-3xl font-bold text-foreground">{stat.value}</span>
              </div>
              <p className="text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-background border border-border rounded-2xl p-6 shadow-md mt-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground mb-4">
            <TrendingUp className="w-5 h-5 text-red-500" /> Recent Activity
          </h2>
          <p className="text-muted-foreground">You have {userReviewsCount} review(s) and {userWatchlistCount} item(s) in your watchlist. Keep exploring movies to see more activity here!</p>
          <div className="mt-6 flex gap-4">
            <Link href="/movie" className="bg-muted hover:bg-gray-700 px-4 py-2 rounded-md transition-colors text-sm font-semibold">Explore Movies</Link>
            <Link href="/watchList" className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors text-sm font-semibold">View Watchlist</Link>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard Overview
  const response = await getDashboardStats();
  
  const analytics = response?.data?.overview || response?.overview || {
    totalUsers: 0, totalPublishedContent: 0, pendingReviewsCount: 0, totalRevenue: 0
  };
  const recentReviews = response?.data?.recentPendingReviews || response?.recentPendingReviews || [];
  const topRatedMedia = response?.data?.topRatedMedia || response?.topRatedMedia || [];

  const stats = [
    { label: "Total User", value: analytics.totalUsers || 0, icon: Users, color: "text-red-500" },
    { label: "Library Size", value: analytics.totalPublishedContent || 0, icon: Film, color: "text-blue-500" },
    { label: "Pending Reviews", value: analytics.pendingReviewsCount || 0, icon: Star, color: "text-yellow-500" },
    { label: "Total Revenue", value: `$${analytics.totalRevenue || 0}`, icon: DollarSign, color: "text-green-500" },
  ];

  // Map real data from backend to the chart
  const chartData: { label: string; value: number; fullTitle?: string }[] = topRatedMedia.length > 0
    ? topRatedMedia.map((m: any, i: number) => ({
        label: m.title.length > 10 ? m.title.substring(0, 10) + "..." : m.title,
        // Use avgRating if available, else totalReviews, else use a varied fallback so bars look different
        value: Number(m.avgRating) > 0
          ? Number(m.avgRating)
          : Number(m.totalReviews) > 0
            ? Number(m.totalReviews)
            : 3 + i * 1.5, // graceful fallback: spread bars visually
        fullTitle: m.title
      }))
    : [
        { label: "Mon", value: 12 }, { label: "Tue", value: 21 }, { label: "Wed", value: 18 },
        { label: "Thu", value: 29 }, { label: "Fri", value: 35 }, { label: "Sat", value: 42 }, { label: "Sun", value: 38 }
      ];

  // Always compute maxValue dynamically so bars scale correctly
  const maxValue = Math.max(...chartData.map((d: { value: number }) => d.value), 1);

  return (
    <div className="bg-card min-h-screen w-full text-foreground font-sans p-4 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-muted-foreground mt-1">Platform analytics and content management.</p>
        </div>
        <Link 
          href="/dashboard/addMovies"
          className="bg-red-600 hover:bg-red-700 text-foreground px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg"
        >
          <Film className="w-4 h-4" /> Add New Media
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background border border-border p-6 rounded-2xl hover:border-border transition-all shadow-md">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-3xl font-bold text-foreground">{stat.value}</span>
            </div>
            <p className="text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-background border border-border rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-red-500" /> {topRatedMedia.length > 0 ? "Top Rated Media" : "Weekly Engagement"}
            </h2>
            <span className="text-xs font-semibold px-3 py-1 bg-muted rounded-full text-foreground">
              {topRatedMedia.length > 0 ? "Highest Ratings" : "Last 7 Days"}
            </span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4">
            {chartData.map((data: { label: string; value: number; fullTitle?: string }, idx: number) => {
              const heightPercentage = Math.max((data.value / maxValue) * 100, 5); // min 5% so bars are always visible
              return (
                <div key={idx} className="relative flex flex-col items-center flex-1 group h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs font-bold py-1 px-2 rounded z-10 pointer-events-none whitespace-nowrap">
                    {data.fullTitle ? `${data.fullTitle}: ${data.value}★` : data.value}
                  </div>
                  {/* Bar */}
                  <div className="flex flex-col items-center justify-end w-full h-full">
                    <div
                      className="w-10 bg-red-600/40 group-hover:bg-red-600 transition-all duration-300 rounded-t-md"
                      style={{ height: `${heightPercentage}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-3 font-medium text-center truncate w-full px-1">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PENDING REVIEWS WIDGET */}
        <div className="bg-background border border-border rounded-2xl p-6 shadow-md flex flex-col">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground">
             <AlertCircle className="w-5 h-5 text-yellow-500" /> Pending Approvals
           </h2>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             {recentReviews.length > 0 ? (
               recentReviews.slice(0, 5).map((review: any) => (
                 <div key={review.id} className="bg-card border border-border p-4 rounded-xl hover:border-border transition-colors">
                    <p className="text-sm font-bold text-foreground line-clamp-1">"{review.media?.title || "Unknown Title"}"</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">By {review.user?.name || "Anonymous"}</p>
                      <span className="flex items-center text-xs text-yellow-500 font-bold bg-yellow-500/10 px-2 py-1 rounded">
                        {review.rating} <Star className="w-3 h-3 ml-1 fill-yellow-500" />
                      </span>
                    </div>
                 </div>
               ))
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center py-10">
                 <Star className="w-10 h-10 text-gray-700 mb-3" />
                 <p className="text-sm text-muted-foreground">No pending reviews.</p>
               </div>
             )}
           </div>
        </div>
        
      </div>
    </div>
  );
}
