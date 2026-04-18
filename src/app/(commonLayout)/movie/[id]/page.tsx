"use client";

import { useState, use, useEffect } from "react";
import { Navbar } from "@/components/ui/navbar";
import { Play, Info, X, ShoppingCart, CreditCard, Loader2, Plus, Check } from "lucide-react"; 
import { useQuery } from "@tanstack/react-query";
import { getMediaById } from "@/service/media.service"; 
import dynamic from "next/dynamic";
import type ReactPlayerType from "react-player";
import { getPurchaseInfo, getSubscriptionInfo, purchaseAMovie } from "@/service/payment.service";
// 🟢 Import both watchlist services!
import { toggleWatchList, checkTheMovieOnWatchList } from "@/service/watchlist.service"; 
import { toast } from "sonner"; 
import ReviewElement from "@/components/module/review/reviewElement";

const ReactPlayer = dynamic(() => import("react-player"), { 
  ssr: false 
}) as typeof ReactPlayerType;

export default function MovieDetailsPage({ params }: { params: Promise<{ id: string }> }) { 
  const { id } = use(params); 

  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [isIntroPlaying, setIsIntroPlaying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);

  const handleLaunchVideo = (url: string) => {
    setPlayingUrl(url);
    setIsIntroPlaying(true); 
  };

  const handleCloseModal = () => {
    setPlayingUrl(null);
    setIsIntroPlaying(false);
  };

  // 1️⃣ Fetch media details
  const { data: mediaResponse, isLoading, isError } = useQuery<any>({
    queryKey: ["media-details", id],
    queryFn: () => getMediaById(id),
  });

  const movie = mediaResponse?.data || mediaResponse;

  // 2️⃣ Fetch subscription info
  const {data: subscribtionResponse, isLoading: isSubscribtionLoading} = useQuery<any>({
    queryKey: ["subscription"],
    queryFn: () => getSubscriptionInfo(),
  });

  // 3️⃣ Fetch purchase info
  const {data: isPurchase, isLoading: isPurchaseLoading} = useQuery<any>({
    queryKey: ["isPurchase", movie?.id],
    queryFn: () => getPurchaseInfo(movie?.id),
    enabled: !!movie?.id
  });

  // 🟢 4️⃣ NEW: Fetch Watchlist Status
  const { data: watchListCheckResponse, isLoading: isWatchListCheckLoading } = useQuery<any>({
    queryKey: ["watchlist-check", id],
    queryFn: () => checkTheMovieOnWatchList(id),
    enabled: !!id, // Only run if we have the ID from the URL
  });

  // 🟢 NEW: Update the local state when the watchlist check finishes
  useEffect(() => {
    if (watchListCheckResponse !== undefined && watchListCheckResponse !== null) {
      // Bulletproof check just in case it's nested (handles true, {success: true}, {data: true})
      const isListed = 
        watchListCheckResponse === true || 
        watchListCheckResponse?.data === true || 
        watchListCheckResponse?.success === true;
        
      setIsWatchlisted(isListed);
    }
  }, [watchListCheckResponse]);

  const isSubscribed = subscribtionResponse === true || subscribtionResponse?.data === true || subscribtionResponse?.success === true;
  const hasPurchased = isPurchase === true || isPurchase?.data === true || isPurchase?.success === true;

  const hasAccess = isSubscribed || hasPurchased;

  const rentPrice = movie?.rentPrice ? `$${movie.rentPrice}` : "$3.00";
  const buyPrice = movie?.buyPrice ? `$${movie.buyPrice}` : "$15.00";

  const handleCheckout = async (type: "RENTAL" | "ONE_TIME_BUY" | "SUBSCRIPTION") => {
    try {
      setIsRedirecting(true);
      const checkoutUrl = await purchaseAMovie(type, movie?.id);
      if (checkoutUrl) {
        window.location.href = checkoutUrl; 
      } else {
        toast.error("Failed to create checkout session. Please try again.");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Checkout failed", error);
      toast.error("Something went wrong during checkout.");
      setIsRedirecting(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!id) return;
    
    try {
      setIsWatchlistLoading(true);
      const res = await toggleWatchList(id); 
      
      if (!res) {
        toast.error("Action failed: Backend returned nothing.");
        return;
      }

      const resString = JSON.stringify(res).toLowerCase();

      if (resString.includes('"success":true') || resString.includes('"success": true')) {
        if (resString.includes('added')) {
          setIsWatchlisted(true);
          toast.success("Added to Watchlist"); 
        } else {
          setIsWatchlisted(false);
          toast.success("Removed from Watchlist"); 
        }
      } else {
        toast.error("Failed to update watchlist"); 
      }

    } catch (error) {
      console.error("Failed to toggle watchlist", error);
      toast.error("An error occurred updating your watchlist"); 
    } finally {
      setIsWatchlistLoading(false);
    }
  };

  // 🟢 Added `isWatchListCheckLoading` to the main loading screen 
  if (isLoading || isSubscribtionLoading || isPurchaseLoading || isWatchListCheckLoading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center">
        <Navbar />
        <h1 className="text-3xl font-bold mb-2 text-gray-300">Movie Not Found</h1>
        <p className="text-gray-500">We couldn't locate this title. It may have been removed.</p>
      </div>
    );
  }

  const castList = movie.cast?.map((c: any) => c.actor?.name).filter(Boolean).join(", ") || "Unknown";
  const genreList = movie.genres?.map((g: any) => g.genre?.name).filter(Boolean).join(", ") || "Unknown";

  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white">
      <Navbar />

      <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden">
        
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-60" 
          style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }} 
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full px-4 md:px-12 pb-16 pt-32 max-w-4xl z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 text-sm md:text-base font-semibold text-gray-300 mb-6 drop-shadow-md">
            {movie.avgRating && (
               <span className="text-green-500">{Math.round(movie.avgRating * 20)}% Match</span>
            )}
            <span>{movie.releaseYear}</span>
            <span className="border border-gray-500 px-1.5 rounded-sm text-xs text-gray-400">
              {movie.pricingTier}
            </span>
            <span>HD</span>
          </div>

          <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-lg leading-snug">
            {movie.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-10">
            
            {hasAccess ? (
              <button 
                onClick={() => handleLaunchVideo(movie.streamingUrl)} 
                className="flex items-center gap-2 bg-white text-black px-6 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-lg hover:bg-white/80 transition-colors"
              >
                <Play className="w-6 h-6 fill-current" /> Play
              </button>
            ) : (
              <>
                <button 
                  onClick={() => handleCheckout("SUBSCRIPTION")}
                  disabled={isRedirecting}
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Subscribe to Watch
                </button>
                
                <button 
                  onClick={() => handleCheckout("RENTAL")}
                  disabled={isRedirecting}
                  className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  Rent 48hr ({rentPrice})
                </button>

                <button 
                  onClick={() => handleCheckout("ONE_TIME_BUY")}
                  disabled={isRedirecting}
                  className="flex items-center gap-2 bg-gray-800 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-lg hover:bg-gray-700 transition-colors border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                  Buy ({buyPrice})
                </button>
              </>
            )}

            <button 
              onClick={handleWatchlistToggle}
              disabled={isWatchlistLoading}
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-gray-500/40 text-white rounded-full hover:bg-gray-500/60 transition-colors backdrop-blur-sm border border-gray-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWatchlistLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isWatchlisted ? (
                <Check className="w-6 h-6 text-green-400" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
            
            {movie.trailerUrl && (
              <button 
                onClick={() => handleLaunchVideo(movie.trailerUrl)}
                className="flex items-center gap-2 bg-gray-500/40 text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md font-bold text-lg hover:bg-gray-500/60 transition-colors backdrop-blur-sm border border-gray-500/50"
              >
                <Info className="w-6 h-6" /> Trailer
              </button>
            )}
          </div>

          <div className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
            <p className="mb-2">
              <span className="text-gray-500">Cast:</span> <span className="text-gray-300">{castList}</span>
            </p>
            <p className="mb-2">
              <span className="text-gray-500">Director:</span> <span className="text-gray-300">{movie.director}</span>
            </p>
            <p>
              <span className="text-gray-500">Genres:</span> <span className="text-gray-300">{genreList}</span>
            </p>
          </div>
        </div>
      </div>

      {playingUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-red-600 rounded-full text-white transition-colors backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <ReactPlayer 
              src={isIntroPlaying ? "/cinehub-intro.mp4" : playingUrl}
              width="100%"
              height="100%"
              controls={!isIntroPlaying}
              playing={true}
              onEnded={() => {
                if (isIntroPlaying) {
                  setIsIntroPlaying(false);
                }
              }}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
        </div>
      )}

      <div>
        <ReviewElement movieId={movie.id}/>
      </div>
    </div>
  );
}