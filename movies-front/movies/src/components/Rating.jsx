import { useState } from 'react';
import api from '../api/axios';

const Rating = ({ contentId, contentType, initialRating = 0 }) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (score) => {
    setRating(score);
    setIsSubmitting(true);

    try {
      await api.post('/interactions/rate/', {
        content_id: contentId,
        content_type: contentType,
        score: score
      });
    } catch (error) {
      console.error('Rating submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-800/50 w-fit px-4 py-2 rounded-full border border-gray-700/50 backdrop-blur-sm">
      {[...Array(10)].map((_, index) => {
        const score = index + 1;
        
        return (
          <button
            key={score}
            type="button"
            disabled={isSubmitting}
            className="focus:outline-none transition-transform hover:scale-125"
            onMouseEnter={() => setHover(score)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(score)}
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                score <= (hover || rating) 
                  ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' 
                  : 'text-gray-600 hover:text-gray-500'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      
      {/* Display current hovered or selected score */}
      <span className="ml-3 text-sm font-bold text-gray-300 min-w-[2.5rem] text-center">
        {hover || rating ? `${hover || rating}/10` : '-/10'}
      </span>
    </div>
  );
};

export default Rating;