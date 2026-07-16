import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Series = () => {
  const [series, setSeries] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSeries, setCurrentSeries] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Text fields state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_date: '',
    type: 'SERIES', // 'SERIES' or 'ANIME'
    genre: '',
  });

  // Files state (No video file here, only images)
  const [files, setFiles] = useState({
    poster: null,
    cover_image: null,
  });

  // Fetch Series & Genres
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [seriesRes, genresRes] = await Promise.all([
          api.get('/series/'),
          api.get('/genres/')
        ]);
        
        setSeries(seriesRes.data.results ? seriesRes.data.results : seriesRes.data);
        setGenres(genresRes.data.results ? genresRes.data.results : genresRes.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Impossible de charger les données.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const openModal = (item = null) => {
    if (item) {
      setCurrentSeries(item);
      setFormData({
        title: item.title || '',
        description: item.description || '',
        release_date: item.release_date || '',
        type: item.type || 'SERIES',
        genre: item.genre?.id || item.genre || '',
      });
    } else {
      setCurrentSeries(null);
      setFormData({ title: '', description: '', release_date: '', type: 'SERIES', genre: '' });
    }
    setFiles({ poster: null, cover_image: null });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSeries(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    
    Object.keys(formData).forEach((key) => {
      if (formData[key]) submitData.append(key, formData[key]);
    });

    if (files.poster) submitData.append('poster', files.poster);
    if (files.cover_image) submitData.append('cover_image', files.cover_image);

    try {
      if (currentSeries) {
        // UPDATE
        const response = await api.patch(`/series/${currentSeries.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSeries(series.map(s => s.id === currentSeries.id ? response.data : s));
      } else {
        // CREATE
        const response = await api.post('/series/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSeries([response.data, ...series]);
      }
      closeModal();
    } catch (err) {
      console.error('Error saving series:', err);
      alert("Erreur lors de la sauvegarde de la série.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette série ? Les saisons et épisodes liés seront aussi supprimés.")) return;

    try {
      await api.delete(`/series/${id}/`);
      setSeries(series.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting series:', err);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Séries & Animes</h1>
          <p className="text-gray-400 mt-1">Créez la fiche de la série avant d'y ajouter des épisodes.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-medium hover:bg-red-700 transition shadow-lg flex items-center gap-2"
        >
          <span>+</span> Ajouter une Série
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Series Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Affiche</th>
                <th className="px-6 py-4 font-semibold">Titre</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Genre</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : series.length > 0 ? (
                series.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      {item.poster ? (
                        <img src={item.poster} alt={item.title} className="w-12 h-16 object-cover rounded shadow" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${item.type === 'ANIME' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {item.genre?.name || "Non défini"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(item)}
                        className="text-blue-400 hover:text-blue-300 transition font-medium"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-400 transition font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Aucune série trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {currentSeries ? 'Modifier la Série' : 'Ajouter une Série'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition text-2xl leading-none">
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="series-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre *</label>
                    <input type="text" name="title" required value={formData.title} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Synopsis</label>
                    <textarea name="description" rows="3" value={formData.description} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500 resize-none"></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date de sortie</label>
                    <input type="date" name="release_date" value={formData.release_date} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select name="type" value={formData.type} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500">
                      <option value="SERIES">Série</option>
                      <option value="ANIME">Anime</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Genre Principal</label>
                    <select name="genre" value={formData.genre} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500">
                      <option value="">Sélectionnez un genre</option>
                      {genres.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="border-gray-800" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Affiche (Poster) {currentSeries && '(Optionnel)'}</label>
                    <input type="file" name="poster" accept="image/*" onChange={handleFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Couverture (Background)</label>
                    <input type="file" name="cover_image" accept="image/*" onChange={handleFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 rounded-b-xl flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} disabled={isSubmitting}
                className="px-4 py-2 rounded-md font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-50">
                Annuler
              </button>
              <button type="submit" form="series-form" disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center">
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer la série'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Series;