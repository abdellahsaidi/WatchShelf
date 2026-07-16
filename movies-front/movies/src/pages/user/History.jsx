import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/Card';

const History = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Adjust endpoint based on your Django URLs
        const response = await api.get('/history/');
        
        // Handle pagination or direct array response
        const data = response.data.results ? response.data.results : response.data;
        
        // Sometimes history API returns nested objects like { watch_time: 120, movie: {...} }
        // If your API returns nested objects, map them here: 
        // const formattedData = data.map(item => item.movie || item.episode);
        
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError("Impossible de charger votre historique de visionnage.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-800 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Watch History</h1>
          <p className="text-gray-400 mt-2">Pick up right where you left off.</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-center">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && history.length === 0 && (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
          <span className="text-6xl block mb-4 text-gray-600">🕒</span>
          <h2 className="text-2xl font-bold text-white mb-2">No watch history</h2>
          <p className="text-gray-400 mb-6">You haven't watched any movies or series recently.</p>
          <Link 
            to="/" 
            className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition shadow-lg"
          >
            Start Watching
          </Link>
        </div>
      )}

      {/* History Grid */}
      {!isLoading && !error && history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {history.map((item) => (
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

export default History;