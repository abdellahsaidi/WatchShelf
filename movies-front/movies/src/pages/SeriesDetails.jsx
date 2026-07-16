import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

import Player from '../components/Player';
import Rating from '../components/Rating';
import FavButton from '../components/FavButton';
import Comments from '../components/Comments';

const SeriesDetails = () => {
  const { slug } = useParams();
  const [series, setSeries] = useState(null);
  
  // States for Season & Episode selection
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeries = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/series/${slug}/`);
        const data = response.data;
        setSeries(data);

        // Auto-select first season and first episode if they exist
        if (data.seasons && data.seasons.length > 0) {
          const firstSeason = data.seasons[0];
          setSelectedSeason(firstSeason);
          
          if (firstSeason.episodes && firstSeason.episodes.length > 0) {
            setSelectedEpisode(firstSeason.episodes[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load series details:', err);
        setError("Impossible de charger les détails de la série.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, [slug]);

  // Handle Season Tab Click
  const handleSeasonClick = (season) => {
    setSelectedSeason(season);
    // Auto-select the first episode of the newly clicked season
    if (season.episodes && season.episodes.length > 0) {
      setSelectedEpisode(season.episodes[0]);
    } else {
      setSelectedEpisode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-3xl font-bold text-white mb-4">Oups !</h2>
        <p className="text-red-500 mb-6">{error || "Série introuvable."}</p>
        <Link to="/series" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full pb-16">
      
      {/* 🌟 HERO SECTION */}
      <div className="relative w-full h-[40vh] md:h-[50vh]">
        <div className="absolute inset-0">
          <img 
            src={series.cover_image || series.poster} 
            alt={series.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent"></div>
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-end pb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg">
            {series.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-300 mb-5">
            <span className="bg-red-600 text-white px-2 py-1 rounded shadow uppercase">
              {series.type === 'ANIME' ? 'ANIME' : 'SÉRIE'}
            </span>
            <span>{series.release_date ? series.release_date.substring(0, 4) : 'N/A'}</span>
            {series.seasons && <span>{series.seasons.length} Saisons</span>}
            {series.genre && <span className="text-red-400">{series.genre.name}</span>}
          </div>

          <div className="flex items-center gap-4">
            <Rating 
              contentId={series.id} 
              contentType="series" 
              initialRating={series.user_rating || 0} 
            />
            <FavButton 
              contentId={series.id} 
              contentType="series" 
              initialIsFavorite={series.is_favorite || false} 
            />
          </div>
        </div>
      </div>

      {/* 📄 CONTENT SECTION */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LEFT COLUMN: Player & Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Player Area */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-2xl font-bold text-white">
                  {selectedEpisode ? `S${selectedSeason?.season_number} E${selectedEpisode.episode_number} - ${selectedEpisode.title}` : 'Watch Now'}
                </h3>
              </div>

              {selectedEpisode && selectedEpisode.video_file ? (
                <Player 
                  videoUrl={selectedEpisode.video_file} 
                  posterUrl={selectedEpisode.thumbnail || series.cover_image || series.poster}
                  contentId={selectedEpisode.id} 
                  contentType="episode" 
                />
              ) : (
                <div className="bg-gray-800 rounded-xl aspect-video flex items-center justify-center border border-gray-700 shadow-lg">
                  <p className="text-gray-500">Sélectionnez un épisode pour commencer la lecture.</p>
                </div>
              )}
            </div>

            {/* Synopsis */}
            <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
              <h4 className="text-lg font-bold text-white mb-2">À propos de la série</h4>
              <p className="text-gray-300 leading-relaxed">
                {series.description || "Aucun synopsis disponible."}
              </p>
            </div>

            {/* Comments - Attached to the Series, not individual episodes */}
            <Comments contentId={series.id} contentType="series" />
          </div>

          {/* RIGHT COLUMN: Seasons & Episodes Selector */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm overflow-hidden flex flex-col h-[600px]">
              
              {/* Seasons Tabs (Horizontal Scroll) */}
              <div className="bg-gray-900/50 p-2 border-b border-gray-700 flex overflow-x-auto hide-scrollbar snap-x">
                {series.seasons && series.seasons.map((season) => (
                  <button
                    key={season.id}
                    onClick={() => handleSeasonClick(season)}
                    className={`flex-none px-4 py-3 text-sm font-bold whitespace-nowrap transition snap-start border-b-2 ${
                      selectedSeason?.id === season.id 
                        ? 'text-red-500 border-red-500 bg-gray-800' 
                        : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    Saison {season.season_number}
                  </button>
                ))}
              </div>

              {/* Episodes List (Vertical Scroll) */}
              <div className="flex-grow overflow-y-auto p-2 custom-scrollbar">
                {selectedSeason?.episodes && selectedSeason.episodes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedSeason.episodes.map((episode) => (
                      <button
                        key={episode.id}
                        onClick={() => setSelectedEpisode(episode)}
                        className={`w-full text-left p-3 rounded-lg flex gap-4 transition items-center group ${
                          selectedEpisode?.id === episode.id
                            ? 'bg-red-600/20 border border-red-500/50'
                            : 'hover:bg-gray-700 border border-transparent'
                        }`}
                      >
                        {/* Episode Number/Play Icon */}
                        <div className="w-8 flex-none text-center font-bold text-gray-500 group-hover:text-red-400">
                          {selectedEpisode?.id === episode.id ? '▶' : episode.episode_number}
                        </div>
                        
                        {/* Episode Details */}
                        <div className="flex-grow">
                          <h5 className={`text-sm font-bold line-clamp-1 ${selectedEpisode?.id === episode.id ? 'text-white' : 'text-gray-300'}`}>
                            {episode.title}
                          </h5>
                          {episode.duration && (
                            <p className="text-xs text-gray-500 mt-1">{episode.duration} min</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 p-6 text-center">
                    Aucun épisode disponible pour cette saison.
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SeriesDetails;