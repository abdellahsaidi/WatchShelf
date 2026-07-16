import { useState } from 'react';
import api from '../api/axios';

const FavButton = ({ contentId, contentType, initialIsFavorite = false }) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    
    // Optimistic UI update for instant feedback
    setIsFavorite(!isFavorite);

    try {
      await api.post('/interactions/favorite/', {
        content_id: contentId,
        content_type: contentType
      });
    } catch (error) {
      // Revert state if API call fails
      setIsFavorite(isFavorite);
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`group flex items-center justify-center p-3 rounded-full border transition-all duration-300 ${
        isFavorite 
          ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20' 
          : 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/80'
      } backdrop-blur-sm focus:outline-none`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <svg
        className={`w-6 h-6 transition-transform duration-300 ${
          isFavorite 
            ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
            : 'text-gray-400 group-hover:text-gray-300'
        } ${isLoading ? 'animate-pulse' : ''}`}
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={isFavorite ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavButton;