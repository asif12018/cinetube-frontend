"use client"; // 🔴 THIS MUST BE EXACTLY ON LINE 1

import { Suspense } from "react"; // 🟢 1. Imported Suspense
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/navbar";
import { Hero } from "@/components/ui/hero";
import { MovieRow } from "@/components/ui/movie-row";
import { MovieCard } from "@/components/ui/movie-card"; 
import { SplashIntro } from "@/components/ui/splash-intro"; 
import { Pricing } from "@/components/ui/pricing"; 
import { getMedia } from "@/service/media.service";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { AiMovieRecommendation } from "@/components/ui/ai-movie-recommendation";
import { AiMovieRow } from "@/components/ui/ai-movie-row";

// 🟢 2. Renamed your original Home component to HomeContent
function HomeContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search");

  const { data: media, isLoading } = useQuery<any>({
    queryKey: ["media", searchQuery],
    queryFn: () => getMedia(searchQuery ? `searchTerm=${searchQuery}` : "")
  });

  const moviesList = media?.data?.data?.data || media?.data?.data || media?.data || [];
  const isSearching = !!searchQuery;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      
      {/* We only show the intro if the user isn't actively searching for something */}
      {!isSearching && <SplashIntro />}

      
      
      {!isSearching && <Hero />}
      
      {/* MAIN CONTENT AREA */}
      <main className={isSearching ? "pt-32 px-4 md:px-12 min-h-[75vh]" : "pb-20"}>
        
        {/* 🔥 AI RECOMMENDATION WIDGET ADDED HERE SO IT'S VISIBLE ON HOME PAGE 🔥 */}
        <div className="pt-8 px-4 md:px-12">
          <AiMovieRecommendation />
        </div>

        {isLoading ? (
          /* SKELETON LOADER */
          <div className={isSearching ? "" : "pt-12 px-4 md:px-12"}>
             <div className="w-48 h-8 bg-muted/60 rounded-md animate-pulse mb-6" />
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="aspect-[2/3] bg-muted/40 rounded-md animate-pulse shadow-xl" />
               ))}
             </div>
          </div>
        ) : isSearching ? (
          
          /* SEARCH RESULTS VIEW (Grid Layout) */
          <section className="animate-in fade-in duration-500">
            <h1 className="text-2xl md:text-3xl font-medium text-muted-foreground mb-8 tracking-wide">
              Explore titles related to: <span className="text-foreground font-bold">"{searchQuery}"</span>
            </h1>
            
            {moviesList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
                {moviesList.map((movie: any) => (
                  <div key={movie.id} className="transition-transform duration-300 hover:scale-105 hover:z-10 cursor-pointer">
                    <MovieCard movie={movie} /> 
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <SearchIcon className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-2xl font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any movies or series matching "{searchQuery}". Try adjusting your search criteria.
                </p>
              </div>
            )}
          </section>

        ) : (
          
          /* DEFAULT CATEGORY ROWS (Clean Spacing, No Overlap) */
          <div className="flex flex-col gap-8 md:gap-12 mt-8 md:mt-12 animate-in fade-in duration-700">
            
            <AiMovieRow movies={moviesList} />

            <MovieRow 
              title="Trending Now" 
              movies={[...moviesList].sort((a: any, b: any) => (b.views || b.likes || 0) - (a.views || a.likes || 0)).slice(0, 5)} 
            />
            
            <MovieRow 
              title="Top Rated This Week" 
              movies={[...moviesList].filter(m => m.avgRating > 0).sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0)).slice(0, 5)} 
            />

            <MovieRow 
              title="Newly Added" 
              movies={[...moviesList].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)} 
            />
            
            <MovieRow 
              title="Editor’s Picks" 
              movies={moviesList.filter((m: any) => m.isEditorPick === true).slice(0, 5)} 
            />
            
            {/* PRICING SECTION */}
            <Pricing />
            
            {/* FAQ SECTION */}
            <div className="w-full max-w-5xl mx-auto px-4 md:px-12 py-16">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground text-lg">Everything you need to know about CineTube.</p>
              </div>
              <div className="space-y-4">
                {[
                  { q: "What is CineTube?", a: "CineTube is a premium movie streaming platform offering the latest blockbusters and timeless classics." },
                  { q: "How much does it cost?", a: "You can watch movies for free, rent them for 48 hours, or subscribe for unlimited access." },
                  { q: "Can I watch on multiple devices?", a: "Yes, you can stream on your TV, laptop, tablet, or smartphone." },
                  { q: "How do I cancel my subscription?", a: "You can cancel your subscription at any time from your account settings." }
                ].map((faq, index) => (
                  <div key={index} className="bg-muted/30 border border-border rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        )}
      </main>
    </div>
  );
}

// 🟢 3. The new default export wraps everything in Suspense!
export default function Home() {
  return (
    // Shows a cool red spinner matching your theme while Next.js figures out the URL parameters
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
