import React from 'react';
import { getDashboardStats } from "@/service/admin.service"; 
import { Film, Users, Star, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import Link from 'next/link';

export default async function DashboardOverViewPage() {
  const response = await getDashboardStats();
  
  const analytics = response?.data?.overview || response?.overview || {
    totalUsers: 0, totalPublishedContent: 0, pendingReviewsCount: 0, totalRevenue: 0
  };
  const recentReviews = response?.data?.recentPendingReviews || response?.recentPendingReviews || [];

  const stats = [
    { label: "Total User", value: analytics.totalUsers || 0, icon: Users, color: "text-red-500" },
    { label: "Library Size", value: analytics.totalPublishedContent || 0, icon: Film, color: "text-blue-500" },
    { label: "Pending Reviews", value: analytics.pendingReviewsCount || 0, icon: Star, color: "text-yellow-500" },
    { label: "Total Revenue", value: `$${analytics.totalRevenue || 0}`, icon: DollarSign, color: "text-green-500" },
  ];

  const chartData = [
    { label: "Mon", value: 12 }, { label: "Tue", value: 21 }, { label: "Wed", value: 18 },
    { label: "Thu", value: 29 }, { label: "Fri", value: 35 }, { label: "Sat", value: 42 }, { label: "Sun", value: 38 }
  ];
  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    // 🟢 FORCING THE DARK THEME AND FONT HERE TO FIX THE LEAK
    <div className="bg-[#0a0a0a] min-h-screen w-full text-white font-sans p-4 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
          <p className="text-gray-400 mt-1">Platform analytics and content management.</p>
        </div>
        <Link 
          href="/dashboard/addMovies"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg"
        >
          <Film className="w-4 h-4" /> Add New Media
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#141414] border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-all shadow-md">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <span className="text-3xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-gray-400 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-[#141414] border border-gray-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-red-500" /> Weekly Engagement
            </h2>
            <span className="text-xs font-semibold px-3 py-1 bg-gray-800 rounded-full text-gray-300">Last 7 Days</span>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 pt-4">
            {chartData.map((data, idx) => {
              const heightPercentage = (data.value / maxValue) * 100;
              return (
                <div key={idx} className="relative flex flex-col items-center flex-1 group h-full justify-end">
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-xs font-bold py-1 px-2 rounded z-10 pointer-events-none">
                    {data.value}
                  </div>
                  {/* Bar - Fixed the visibility! */}
                  <div 
                    className="w-full max-w-[40px] bg-red-600/20 group-hover:bg-red-600 transition-colors rounded-t-md relative"
                    style={{ height: `${heightPercentage}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-3 font-medium">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PENDING REVIEWS WIDGET */}
        <div className="bg-[#141414] border border-gray-800 rounded-2xl p-6 shadow-md flex flex-col">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
             <AlertCircle className="w-5 h-5 text-yellow-500" /> Pending Approvals
           </h2>
           
           <div className="flex-1 overflow-y-auto pr-2 space-y-4">
             {recentReviews.length > 0 ? (
               recentReviews.slice(0, 5).map((review: any) => (
                 <div key={review.id} className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-xl hover:border-gray-700 transition-colors">
                    <p className="text-sm font-bold text-gray-200 line-clamp-1">"{review.media?.title || "Unknown Title"}"</p>
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
                 <p className="text-sm text-gray-400">No pending reviews.</p>
               </div>
             )}
           </div>
        </div>
        
      </div>
    </div>
  );
}