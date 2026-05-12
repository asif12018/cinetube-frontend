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
    // Scroll by ~2 card widths for a snappy feel
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-5 md:py-8">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 md:px-12">
        {/* Section heading */}
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="w-[3px] h-5 md:h-7 bg-red-600 rounded-full" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-wide">
            {title}
          </h2>
        </div>

        {/* Slider wrapper — relative so arrows can anchor to it */}
        <div className="relative">
          {/* ── Left arrow ── */}
          <button
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className={`
              absolute left-0 top-0 bottom-4 z-20
              w-8 sm:w-10
              flex items-center justify-center
              bg-gradient-to-r from-black/90 to-transparent
              transition-all duration-300
              ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/50 active:scale-90 transition-all">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </button>

          {/* ── Right arrow ── */}
          <button
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className={`
              absolute right-0 top-0 bottom-4 z-20
              w-8 sm:w-10
              flex items-center justify-center
              bg-gradient-to-l from-black/90 to-transparent
              transition-all duration-300
              ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/50 active:scale-90 transition-all">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </button>

          {/* ── Scrollable row ── */}
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

// Isolated so useEffect runs after the ref is attached
function ScrollableRow({
  movies,
  scrollRef,
  onScroll,
  onMount,
}: {
  movies: any[];
  scrollRef: React.RefObject<HTMLDivElement | null>; // useRef(null) produces RefObject<T | null> in React 18+
  onScroll: () => void;
  onMount: () => void;
}) {
  useEffect(() => {
    onMount();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onMount);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onMount);
    };
  }, [movies]);

  return (
    <div
      ref={scrollRef}
      className="flex overflow-x-auto scrollbar-hide pb-4 gap-3 sm:gap-4 px-1"
      style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
    >
      {movies.map((movie) => (
        <div
          key={movie.id}
          // xs: 2.3 cards visible | sm: 3 | md: 4 | lg: 5
          className="
            w-[42vw]
            sm:w-[30vw]
            md:w-[22vw]
            lg:w-[17vw]
            xl:w-[185px]
            max-w-[210px]
            flex-shrink-0
            transition-transform duration-300
            hover:scale-105 hover:z-10
          "
          style={{ scrollSnapAlign: "start" }}
        >
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
}
