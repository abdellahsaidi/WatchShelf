import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/Card';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('/interactions/favorites/');
        const data = response.data.results ? response.data.results : response.data;
        setFavorites(data);
      } catch (err) {
        console.error('Failed to load favorites:', err);
        setError("Impossible de charger vos favoris pour le moment.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">My Favorites</h1>
        <p className="text-gray-400 mt-2">All your saved movies, TV shows, and anime in one place.</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && favorites.length === 0 && (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
          <span className="text-6xl block mb-4 text-gray-600">❤️</span>
          <h2 className="text-2xl font-bold text-white mb-2">No favorites yet</h2>
          <p className="text-gray-400 mb-6">You haven't saved any movies or series to your favorites.</p>
          <Link 
            to="/explore" 
            className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition shadow-lg"
          >
            Explore Catalogue
          </Link>
        </div>
      )}

      {!isLoading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {favorites.map((item) => (
            <Card 
              key={`${item.type || 'media'}-${item.id}`} 
              item={item} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;