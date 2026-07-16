import { Link } from 'react-router-dom';

const Card = ({ item }) => {
  // Determine route based on content type
  const isSeriesOrAnime = item.type === 'TV_SHOW' || item.type === 'ANIME';
  const linkTo = isSeriesOrAnime ? `/series/${item.slug}` : `/movies/${item.slug}`;

  // Determine type badge label
  const typeLabel = item.type === 'TV_SHOW' ? 'SERIES' : (item.type === 'ANIME' ? 'ANIME' : 'MOVIE');

  return (
    <Link to={linkTo} className="group flex-none h-full w-full">
      <div className="relative rounded-lg overflow-hidden shadow-lg transition duration-300 transform group-hover:-translate-y-2 border border-gray-800 group-hover:border-gray-500 bg-gray-800 h-full flex flex-col">
        
        {/* Poster Image */}
        <div className="relative aspect-[2/3] w-full">
          <img 
            src={item.poster} 
            alt={item.title} 
            className="w-full h-full object-cover bg-gray-900"
            loading="lazy"
          />
          
          {/* Rating Badge */}
          {item.rating && (
            <div className="absolute top-2 right-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm border border-gray-700">
              {item.rating} ★
            </div>
          )}
          
          {/* Type Badge */}
          {item.type && (
            <div className="absolute top-2 left-2 bg-red-600/90 text-white text-xs font-bold px-2 py-1 rounded shadow tracking-wider">
              {typeLabel}
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-red-500 transition">
              {item.title}
            </h3>
            <p className="text-gray-400 text-xs mt-1 font-medium">
              {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
            </p>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default Card;