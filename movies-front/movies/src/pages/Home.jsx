import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch trending data on component mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Assure-toi que cet endpoint existe bien côté Django
        const response = await api.get('/trending/'); 
        
        let trendingData = response.data.results ? response.data.results : response.data;

        // 🔥 LA SÉCURITÉ ANTI-CRASH EST ICI :
        // Si l'API renvoie du HTML ou un objet bizarre, on force à un tableau vide
        if (!Array.isArray(trendingData)) {
          console.warn("⚠️ Attention : L'API n'a pas renvoyé un tableau !", trendingData);
          trendingData = []; 
        }

        if (trendingData.length > 0) {
          setFeatured(trendingData[0]); // First item for the Hero section
          setTrending(trendingData.slice(1)); // Rest for the carousel
        } else {
          setTrending([]);
        }
        
      } catch (err) {
        setError('Failed to load trending content. Please try again later.');
        console.error("Error fetching trending data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-grow flex items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full pb-10">

      {/* ========================================== */}
      {/* 🌟 HERO SECTION (Featured Item)          */}
      {/* ========================================== */}
      {featured && (
        <div className="relative w-full h-[70vh] lg:h-[85vh]">
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0">
            <img
              src={featured.cover_image || featured.poster}
              alt={featured.title || "Featured Content"}
              className="w-full h-full object-cover bg-gray-900"
            />
            {/* Gradient to make text readable (dark at bottom and left) */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                {featured.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6 text-sm font-medium text-gray-300">
                {featured.rating && <span className="text-green-500">{featured.rating} Rating</span>}
                {featured.release_date && <span>{featured.release_date.substring(0, 4)}</span>}
                <span className="bg-gray-800 px-2 py-1 rounded border border-gray-700">
                  {featured.type === 'TV_SHOW' ? 'TV Series' : featured.type || 'Movie'}
                </span>
              </div>

              <p className="text-lg text-gray-300 mb-8 line-clamp-3 md:line-clamp-4">
                {featured.description || "Aucune description disponible pour ce contenu."}
              </p>

              <div className="flex space-x-4">
                <Link
                  to={featured.type === 'TV_SHOW' || featured.type === 'SERIES' ? `/series/${featured.slug}` : `/movies/${featured.slug}`}
                  className="bg-red-600 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-red-700 transition shadow-lg flex items-center"
                >
                  <span className="mr-2">▶</span> Play Now
                </Link>
                <Link
                  to={featured.type === 'TV_SHOW' || featured.type === 'SERIES' ? `/series/${featured.slug}` : `/movies/${featured.slug}`}
                  className="bg-gray-800/80 text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-700 transition border border-gray-600 backdrop-blur-sm"
                >
                  More Info
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 TRENDING CAROUSEL SECTION             */}
      {/* ========================================== */}
      {Array.isArray(trending) && trending.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-8 md:-mt-16 relative z-10">
          <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>

          {/* Horizontal Scroll Container */}
          <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 snap-x hide-scrollbar">
            {trending.map((item) => (
              <Link
                key={item.id || Math.random()} // Fallback key si l'API déconne
                to={item.type === 'TV_SHOW' || item.type === 'SERIES' ? `/series/${item.slug}` : `/movies/${item.slug}`}
                className="flex-none w-40 md:w-48 lg:w-56 group snap-start"
              >
                <div className="relative rounded-lg overflow-hidden shadow-lg transition duration-300 transform group-hover:scale-105 border border-transparent group-hover:border-gray-500 bg-gray-800">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-60 md:h-72 lg:h-80 object-cover"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                    {item.rating && <p className="text-red-500 text-xs mt-1 font-medium">{item.rating} ★</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Si jamais le tableau est vide (API n'a rien renvoyé de valide) */}
      {(!Array.isArray(trending) || (trending.length === 0 && !featured)) && (
        <div className="max-w-7xl mx-auto px-4 mt-10">
           <p className="text-gray-500">Aucun contenu tendance pour le moment.</p>
        </div>
      )}

    </div>
  );
};

export default Home;