import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Card from '../../components/Card';

const CollectionDetails = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/interactions/collections/${id}/`);
        setCollection(response.data);
      } catch (err) {
        console.error('Failed to load collection details:', err);
        setError("Impossible de charger les détails de cette collection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollectionDetails();
  }, [id]);

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      
      {/* Back Button & Header */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <Link 
          to="/collections" 
          className="inline-flex items-center text-gray-400 hover:text-white transition mb-4 text-sm font-medium"
        >
          <span className="mr-2">←</span> Back to Collections
        </Link>
        
        {collection && (
          <div>
            <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
            <p className="text-gray-400 mt-2">
              {collection.items?.length || 0} items in this playlist
            </p>
          </div>
        )}
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
      {!isLoading && !error && collection && (!collection.items || collection.items.length === 0) && (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
          <span className="text-6xl block mb-4 text-gray-600">📭</span>
          <h2 className="text-2xl font-bold text-white mb-2">This collection is empty</h2>
          <p className="text-gray-400 mb-6">Start adding movies and series to this playlist.</p>
          <Link 
            to="/explore" 
            className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition shadow-lg"
          >
            Explore Catalogue
          </Link>
        </div>
      )}

      {/* Media Grid */}
      {!isLoading && !error && collection && collection.items && collection.items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
          {collection.items.map((item) => (
            <div key={`${item.type || 'media'}-${item.id}`} className="relative group">
              <Card item={item} />
              
              {/* Optional: Remove button overlay (needs API endpoint to work) */}
              {/* <button 
                className="absolute top-2 right-2 bg-red-600/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition z-10 hover:bg-red-700 shadow-lg"
                title="Remove from collection"
              >
                ✕
              </button> 
              */}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CollectionDetails;