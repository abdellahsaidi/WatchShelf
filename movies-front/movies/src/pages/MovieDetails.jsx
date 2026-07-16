import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

// Import our custom components
import Player from '../components/Player';
import Rating from '../components/Rating';
import FavButton from '../components/FavButton';
import Comments from '../components/Comments';

const MovieDetails = () => {
  const { slug } = useParams(); // Get movie slug from URL
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/movies/${slug}/`);
        setMovie(response.data);
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError("Impossible de charger les détails du film. Il a peut-être été supprimé.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovie();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Oups !</h2>
        <p className="text-red-500 mb-6">{error || "Film introuvable."}</p>
        <Link to="/movies" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full pb-16">
      
      {/* 🌟 HERO SECTION (Backdrop & Basic Info) */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        <div className="absolute inset-0">
          {/* Use cover_image if available, otherwise poster */}
          <img 
            src={movie.cover_image || movie.poster} 
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300 mb-6">
            <span className="bg-red-600 text-white px-2 py-1 rounded shadow">FILM</span>
            <span>{movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
            {movie.duration && <span>{movie.duration} min</span>}
            {movie.genre && <span className="text-red-400">{movie.genre.name}</span>}
          </div>

          {/* Interactions: Rating & Favorite */}
          <div className="flex items-center gap-4">
            <Rating 
              contentId={movie.id} 
              contentType="movie" 
              initialRating={movie.user_rating || 0} 
            />
            <FavButton 
              contentId={movie.id} 
              contentType="movie" 
              initialIsFavorite={movie.is_favorite || false} 
            />
          </div>
        </div>
      </div>

      {/* 📄 CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Synopsis & Player */}
          <div className="lg:col-span-2 space-y-10">
            {/* Synopsis */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Synopsis</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.description || "Aucun synopsis disponible pour ce film."}
              </p>
            </div>

            {/* Video Player */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">Watch Now</h3>
              {movie.video_file ? (
                <Player 
                  videoUrl={movie.video_file} 
                  posterUrl={movie.cover_image || movie.poster}
                  contentId={movie.id} 
                  contentType="movie" 
                />
              ) : (
                <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center border border-gray-700">
                  <p className="text-gray-500">Vidéo non disponible pour le moment.</p>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <Comments contentId={movie.id} contentType="movie" />
          </div>

          {/* Right Column: Poster & Details Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 bg-gray-800/50 rounded-xl p-6 border border-gray-700 backdrop-blur-sm">
              <img 
                src={movie.poster} 
                alt={`${movie.title} Poster`} 
                className="w-full rounded-lg shadow-xl mb-6"
              />
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold uppercase">Global Rating</h4>
                  <p className="text-white text-xl font-bold">{movie.rating} ★</p>
                </div>
                <div>
                  <h4 className="text-gray-500 text-sm font-semibold uppercase">Director</h4>
                  <p className="text-white">{movie.director || "Unknown"}</p>
                </div>
                {/* Add more fields here like Cast, Studio, etc if they exist in your DB */}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MovieDetails;