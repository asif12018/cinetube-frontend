"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./movie-card";

interface MovieRowProps {
  title: string;
  movies: any[];
}

export function MovieRow({ title, movies }: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  if (!movies || movies.length === 0) return null;

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-6 md:py-8">
      <div className="max-w-[1400px] mx-auto px-4 md:px-12">
        {/* Section heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[3px] md:w-1 h-6 md:h-7 bg-red-600 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">{title}</h2>
        </div>

        {/* Slider wrapper */}
        <div className="relative group">

          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            className={`absolute left-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-gradient-to-r from-black/80 to-transparent rounded-l-xl transition-all duration-300 ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all">
              <ChevronLeft className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            className={`absolute right-0 top-0 bottom-8 z-10 w-10 flex items-center justify-center bg-gradient-to-l from-black/80 to-transparent rounded-r-xl transition-all duration-300 ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/50 transition-all">
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Scrollable cards */}
          <ScrollableRow
            movies={movies}
            scrollRef={scrollRef}
            onScroll={checkScroll}
            onMount={checkScroll}
          />
        </div>
      </div>
    </section>
  );
}

// Separate component so we can call useEffect properly
function ScrollableRow({
  movies,
  scrollRef,
  onScroll,
  onMount,
}: {
  movies: any[];
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll: () => void;
  onMount: () => void;
}) {
  useEffect(() => {
    onMount();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onMount);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onMount);
    };
  }, [movies]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto scrollbar-hide pb-4 gap-4 px-1"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {movies.map((movie) => (
        <div
          key={movie.id}
          className="w-[155px] sm:w-[175px] md:w-[210px] flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-10"
          style={{ scrollSnapAlign: "start" }}
        >
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
}
