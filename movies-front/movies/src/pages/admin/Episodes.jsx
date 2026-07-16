import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Episodes = () => {
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeriesId, setSelectedSeriesId] = useState('');
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [episodes, setEpisodes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals States
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);

  // Active items for editing
  const [currentEpisode, setCurrentEpisode] = useState(null);

  // Forms States
  const [seasonNumber, setSeasonNumber] = useState('');
  const [episodeData, setEpisodeData] = useState({
    title: '',
    episode_number: '',
    duration: '',
  });
  const [episodeFiles, setEpisodeFiles] = useState({
    thumbnail: null,
    video_file: null,
  });

  // Fetch all series for the dropdown on mount
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await api.get('/series/');
        setSeriesList(response.data.results || response.data);
      } catch (err) {
        console.error('Error fetching series:', err);
      }
    };
    fetchSeries();
  }, []);

  // Fetch seasons when selected series changes
  useEffect(() => {
    if (!selectedSeriesId) {
      setSeasons([]);
      setSelectedSeasonId('');
      return;
    }

    const fetchSeasons = async () => {
      setIsLoading(true);
      try {
        // Fetching series details returns its nested seasons
        const response = await api.get(`/series/${selectedSeriesId}/`);
        setSeasons(response.data.seasons || []);
        setSelectedSeasonId(''); // Reset selected season
      } catch (err) {
        console.error('Error fetching seasons:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, [selectedSeriesId]);

  // Fetch episodes when selected season changes
  useEffect(() => {
    if (!selectedSeasonId) {
      setEpisodes([]);
      return;
    }

    const selectedSeason = seasons.find(s => s.id === parseInt(selectedSeasonId));
    if (selectedSeason) {
      setEpisodes(selectedSeason.episodes || []);
    }
  }, [selectedSeasonId, seasons]);

  // Form Handlers
  const handleEpisodeTextChange = (e) => {
    setEpisodeData({ ...episodeData, [e.target.name]: e.target.value });
  };

  const handleEpisodeFileChange = (e) => {
    setEpisodeFiles({ ...episodeFiles, [e.target.name]: e.target.files[0] });
  };

  // Open Episode Modal (Create or Edit)
  const openEpisodeModal = (episode = null) => {
    if (episode) {
      setCurrentEpisode(episode);
      setEpisodeData({
        title: episode.title || '',
        episode_number: episode.episode_number || '',
        duration: episode.duration || '',
      });
    } else {
      setCurrentEpisode(null);
      setEpisodeData({ title: '', episode_number: '', duration: '' });
    }
    setEpisodeFiles({ thumbnail: null, video_file: null });
    setIsEpisodeModalOpen(true);
  };

  // CRUD Season
  const handleCreateSeason = async (e) => {
    e.preventDefault();
    if (!seasonNumber) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/seasons/', {
        series: selectedSeriesId,
        season_number: seasonNumber
      });
      setSeasons([...seasons, response.data]);
      setSeasonNumber('');
      setIsSeasonModalOpen(false);
    } catch (err) {
      console.error('Error creating season:', err);
      alert('Erreur lors de la création de la saison.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeason = async (id) => {
    if (!window.confirm("Supprimer cette saison supprimera définitivement tous ses épisodes associés. Continuer ?")) return;

    try {
      await api.delete(`/seasons/${id}/`);
      setSeasons(seasons.filter(s => s.id !== id));
      setSelectedSeasonId('');
    } catch (err) {
      console.error('Error deleting season:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // CRUD Episode
  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('season', selectedSeasonId);
    
    Object.keys(episodeData).forEach(key => {
      if (episodeData[key]) submitData.append(key, episodeData[key]);
    });

    if (episodeFiles.thumbnail) submitData.append('thumbnail', episodeFiles.thumbnail);
    if (episodeFiles.video_file) submitData.append('video_file', episodeFiles.video_file);

    try {
      if (currentEpisode) {
        // UPDATE
        const response = await api.patch(`/episodes/${currentEpisode.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        // Update local state
        setEpisodes(episodes.map(ep => ep.id === currentEpisode.id ? response.data : ep));
      } else {
        // CREATE
        const response = await api.post('/episodes/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEpisodes([...episodes, response.data]);
      }
      setIsEpisodeModalOpen(false);
    } catch (err) {
      console.error('Error saving episode:', err);
      alert('Erreur lors de la sauvegarde de l\'épisode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEpisode = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet épisode ?")) return;

    try {
      await api.delete(`/episodes/${id}/`);
      setEpisodes(episodes.filter(ep => ep.id !== id));
    } catch (err) {
      console.error('Error deleting episode:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Gestion des Saisons & Épisodes</h1>
        <p className="text-gray-400 mt-1">Sélectionnez une série pour configurer son contenu.</p>
      </div>

      {/* Selectors bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Series Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">1. Sélectionner une Série / Anime</label>
          <select
            value={selectedSeriesId}
            onChange={(e) => setSelectedSeriesId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 font-bold"
          >
            <option value="">-- Choisissez une Série --</option>
            {seriesList.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {/* Season Selector */}
        {selectedSeriesId && (
          <div className="animate-fade-in">
            <label className="block text-sm font-semibold text-gray-400 mb-2">2. Sélectionner la Saison</label>
            <div className="flex gap-2">
              <select
                value={selectedSeasonId}
                onChange={(e) => setSelectedSeasonId(e.target.value)}
                className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 font-bold"
              >
                <option value="">-- Choisissez une Saison --</option>
                {seasons.map(season => (
                  <option key={season.id} value={season.id}>Saison {season.season_number}</option>
                ))}
              </select>
              <button
                onClick={() => setIsSeasonModalOpen(true)}
                className="bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white px-4 rounded-lg font-bold"
                title="Ajouter une saison"
              >
                +
              </button>
              {selectedSeasonId && (
                <button
                  onClick={() => handleDeleteSeason(selectedSeasonId)}
                  className="bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-500 px-4 rounded-lg transition"
                  title="Supprimer la saison"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Main Section: Episodes List */}
      {!isLoading && selectedSeasonId && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg animate-fade-in">
          
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 flex justify-between items-center">
            <h3 className="font-bold text-white">Liste des Épisodes</h3>
            <button
              onClick={() => openEpisodeModal()}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
            >
              + Ajouter un Épisode
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Numéro</th>
                  <th className="px-6 py-4 font-semibold">Miniature</th>
                  <th className="px-6 py-4 font-semibold">Titre de l'Épisode</th>
                  <th className="px-6 py-4 font-semibold">Durée</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {episodes.length > 0 ? (
                  episodes.map((ep) => (
                    <tr key={ep.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-red-500 font-bold">Ep {ep.episode_number}</td>
                      <td className="px-6 py-4">
                        {ep.thumbnail ? (
                          <img src={ep.thumbnail} alt={ep.title} className="w-16 h-10 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-10 bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-500">N/A</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{ep.title}</td>
                      <td className="px-6 py-4 text-gray-400">{ep.duration ? `${ep.duration} min` : '-'}</td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button onClick={() => openEpisodeModal(ep)} className="text-blue-400 hover:text-blue-300 font-medium">Éditer</button>
                        <button onClick={() => handleDeleteEpisode(ep.id)} className="text-red-500 hover:text-red-400 font-medium">Supprimer</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                      Aucun épisode disponible pour cette saison.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Modal Add Season */}
      {isSeasonModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">Ajouter une Saison</h3>
              <button onClick={() => setIsSeasonModalOpen(false)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateSeason} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de Saison (Chiffre) *</label>
                <input
                  type="number"
                  required
                  value={seasonNumber}
                  onChange={(e) => setSeasonNumber(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder="ex: 1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsSeasonModalOpen(false)} className="text-gray-400 hover:text-white">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add/Edit Episode */}
      {isEpisodeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {currentEpisode ? 'Modifier l\'Épisode' : 'Ajouter un Épisode'}
              </h3>
              <button onClick={() => setIsEpisodeModalOpen(false)} className="text-gray-500 hover:text-white text-2xl">&times;</button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="episode-form" onSubmit={handleEpisodeSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre de l'Épisode *</label>
                    <input type="text" name="title" required value={episodeData.title} onChange={handleEpisodeTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de l'Épisode *</label>
                    <input type="number" name="episode_number" required value={episodeData.episode_number} onChange={handleEpisodeTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Durée (minutes)</label>
                    <input type="number" name="duration" value={episodeData.duration} onChange={handleEpisodeTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>
                </div>

                <hr className="border-gray-800" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Miniature (Thumbnail) {currentEpisode && '(Laisser vide pour conserver)'}</label>
                    <input type="file" name="thumbnail" accept="image/*" onChange={handleEpisodeFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  </div>

                  <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
                    <label className="block text-sm font-bold text-white mb-2">🎬 Fichier Vidéo (MP4, MKV...) {currentEpisode && '(Laisser vide pour conserver)'}</label>
                    <input type="file" name="video_file" accept="video/*" onChange={handleEpisodeFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 rounded-b-xl flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setIsEpisodeModalOpen(false)} disabled={isSubmitting}
                className="px-4 py-2 rounded-md font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-50">
                Annuler
              </button>
              <button type="submit" form="episode-form" disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Upload...
                  </>
                ) : 'Enregistrer'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Episodes;