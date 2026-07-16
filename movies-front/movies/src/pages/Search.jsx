import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import Card from '../components/Card';

const Search = () => {
  // Hook to read the "?q=" parameter from the URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      // Don't fetch if search bar is empty
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Une erreur s'est produite lors de la recherche.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      
      {/* Search Header */}
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">
          Résultats de recherche
        </h1>
        {query && (
          <p className="text-gray-400 mt-2">
            Affichage des résultats pour <span className="text-red-500 font-semibold">"{query}"</span>
          </p>
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

      {/* Empty State (No Results) */}
      {!isLoading && !error && query && results.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500 mb-4">Aucun résultat trouvé 😕</p>
          <p className="text-gray-400">Essayez d'utiliser d'autres mots-clés ou vérifiez l'orthographe.</p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && !error && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => (
            <Card 
              key={`${item.type || 'movie'}-${item.id}`} 
              item={item} 
            />
          ))}
        </div>
      )}

      {/* Prompt State (Empty Search Bar) */}
      {!query && (
        <div className="text-center py-20 text-gray-500">
          <span className="text-6xl block mb-4">🔍</span>
          <p className="text-xl">Tapez un titre pour commencer la recherche...</p>
        </div>
      )}

    </div>
  );
};

export default Search;