import Image from "next/image";
import { Star } from "lucide-react";
import Link from "next/link";
// Note: You might need to update your 'Movie' type in '@/lib/data' to match your API!
// If TypeScript yells at you, temporarily change 'movie: Movie;' to 'movie: any;' below.
import { Movie } from "@/lib/data"; 

interface MovieCardProps {
  movie: any; // I changed this to 'any' just to get you unblocked right now
  className?: string;
}

export function MovieCard({ movie, className = "" }: MovieCardProps) {
  // Fallback image just in case a movie doesn't have a poster in the DB
  const imageSource = movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Poster";

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group relative block w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] aspect-[2/3] mx-auto rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:z-10 ${className}`}
    >
      <div className="relative h-full w-full">
        <Image
          src={imageSource}
          alt={movie.title || "Movie Title"}
          fill
          sizes="(max-width: 768px) 144px, 192px" // Good for performance!
          className="object-cover group-hover:opacity-90 transition-opacity"
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Rating Top-Right */}
        <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {/* Swapped rating for avgRating, and added a fallback for null values */}
            {movie.avgRating ? movie.avgRating.toFixed(1) : "N/A"}
          </div>
        </div>

        {/* Title Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent text-white text-sm font-semibold truncate opacity-0 group-hover:opacity-100 transition-all duration-300">
          {movie.title}
        </div>
      </div>
    </Link>
  );
}
