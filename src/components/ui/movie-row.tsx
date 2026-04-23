import { MovieCard } from "./movie-card";

interface MovieRowProps {
  title: string;
  movies: any[]; // Accepting the actual array of movie objects now!
}

export function MovieRow({ title, movies }: MovieRowProps) {

  
  // Safety check: if no movies were passed, don't render the section
  if (!movies || movies.length === 0) return null;

  return (
    <section className="py-6 md:py-8 pl-4 md:pl-12 overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:ml-3 ml-2">
        {title}
      </h2>
      {/* We rely on MovieCard's built-in mx-2/mx-3 for spacing, so no gap needed here */}
      <div className="flex overflow-x-auto scrollbar-hide pb-8 pr-4 md:pr-12">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}