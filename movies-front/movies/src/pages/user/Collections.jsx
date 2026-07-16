import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for creating a new collection
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get('/interactions/collections/');
        const data = response.data.results ? response.data.results : response.data;
        setCollections(data);
      } catch (err) {
        console.error('Failed to load collections:', err);
        setError("Impossible de charger vos collections.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Handle new collection creation
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      const response = await api.post('/interactions/collections/', {
        name: newCollectionName
      });
      
      // Add the new collection to the UI instantly
      setCollections([response.data, ...collections]);
      setNewCollectionName('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
      // Optional: Handle error message for creation
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Collections</h1>
          <p className="text-gray-400 mt-2">Organize your favorite movies and series into custom playlists.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-medium hover:bg-red-700 transition shadow-lg whitespace-nowrap"
        >
          {showCreateForm ? 'Cancel' : '+ Create Collection'}
        </button>
      </div>

      {/* Create Collection Form */}
      {showCreateForm && (
        <div className="mb-10 bg-gray-800/50 p-6 rounded-xl border border-gray-700 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Collection Name (e.g., Weekend Anime, Action Movies...)"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              required
              className="flex-grow bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={isCreating || !newCollectionName.trim()}
              className="bg-gray-700 text-white px-8 py-3 rounded-md font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isCreating ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      )}

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
      {!isLoading && !error && collections.length === 0 && (
        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-800 border-dashed">
          <span className="text-6xl block mb-4 text-gray-600">📁</span>
          <h2 className="text-2xl font-bold text-white mb-2">No collections yet</h2>
          <p className="text-gray-400 mb-6">Create your first collection to start organizing your watchlists.</p>
          {!showCreateForm && (
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-red-600 text-white px-6 py-2 rounded font-medium hover:bg-red-700 transition shadow-lg"
            >
              Create Collection
            </button>
          )}
        </div>
      )}

      {/* Collections Grid */}
      {!isLoading && !error && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {collections.map((collection) => (
            <Link 
              key={collection.id} 
              to={`/collections/${collection.id}`}
              className="group bg-gray-800/40 border border-gray-700 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:border-gray-500 shadow-lg flex flex-col justify-between h-48 relative overflow-hidden"
            >
              {/* Decorative gradient blob */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-600/10 rounded-full blur-2xl group-hover:bg-red-600/20 transition-all duration-500"></div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                  {collection.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  {collection.items_count || 0} items
                </p>
              </div>
              
              <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                View Collection <span className="ml-2">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
};

export default Collections;