import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null); // null = Create, object = Edit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State pour les champs textes
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    release_date: '',
    duration: '',
    genre: '',
  });

  // State séparé pour les fichiers (upload)
  const [files, setFiles] = useState({
    poster: null,
    cover_image: null,
    video_file: null,
  });

  // Fetch Movies & Genres on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [moviesRes, genresRes] = await Promise.all([
          api.get('/movies/'), // Ajuste si besoin (ex: /admin/movies/)
          api.get('/genres/')
        ]);
        
        setMovies(moviesRes.data.results ? moviesRes.data.results : moviesRes.data);
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

  // Handlers pour les inputs
  const handleTextChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  // Open Modal
  const openModal = (movie = null) => {
    if (movie) {
      setCurrentMovie(movie);
      setFormData({
        title: movie.title || '',
        description: movie.description || '',
        release_date: movie.release_date || '',
        duration: movie.duration || '',
        genre: movie.genre?.id || movie.genre || '',
      });
    } else {
      setCurrentMovie(null);
      setFormData({ title: '', description: '', release_date: '', duration: '', genre: '' });
    }
    // Reset files when opening modal
    setFiles({ poster: null, cover_image: null, video_file: null });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentMovie(null);
  };

  // Submit Handler avec FormData pour les fichiers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Création de l'objet FormData
    const submitData = new FormData();
    
    // 1. Ajouter les champs textes
    Object.keys(formData).forEach((key) => {
      if (formData[key]) submitData.append(key, formData[key]);
    });

    // 2. Ajouter les fichiers SEULEMENT s'ils ont été sélectionnés
    if (files.poster) submitData.append('poster', files.poster);
    if (files.cover_image) submitData.append('cover_image', files.cover_image);
    if (files.video_file) submitData.append('video_file', files.video_file);

    try {
      if (currentMovie) {
        // UPDATE (on utilise put ou patch selon ton backend)
        const response = await api.patch(`/movies/${currentMovie.id}/`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMovies(movies.map(m => m.id === currentMovie.id ? response.data : m));
      } else {
        // CREATE
        const response = await api.post('/movies/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMovies([response.data, ...movies]);
      }
      closeModal();
    } catch (err) {
      console.error('Error saving movie:', err);
      alert("Erreur lors de la sauvegarde du film.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce film ? Cette action est irréversible.")) return;

    try {
      await api.delete(`/movies/${id}/`);
      setMovies(movies.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting movie:', err);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Films</h1>
          <p className="text-gray-400 mt-1">Gérez votre catalogue de films (Upload, Édition, Suppression).</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-medium hover:bg-red-700 transition shadow-lg flex items-center gap-2"
        >
          <span>+</span> Ajouter un Film
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Movies Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Affiche</th>
                <th className="px-6 py-4 font-semibold">Titre</th>
                <th className="px-6 py-4 font-semibold">Année</th>
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
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded shadow" />
                      ) : (
                        <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{movie.title}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {movie.release_date ? movie.release_date.substring(0, 4) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {movie.genre?.name || "Non défini"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(movie)}
                        className="text-blue-400 hover:text-blue-300 transition font-medium"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(movie.id)}
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
                    Aucun film trouvé.
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
          {/* Scrollable Modal Box */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {currentMovie ? 'Modifier le Film' : 'Ajouter un Nouveau Film'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-white transition text-2xl leading-none">
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="movie-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Text Infos - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Titre du Film *</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Durée (minutes)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleTextChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-red-500" />
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

                {/* File Uploads - Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Affiche (Poster) {currentMovie && '(Laissez vide pour conserver)'}</label>
                    <input type="file" name="poster" accept="image/*" onChange={handleFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image de couverture (Background)</label>
                    <input type="file" name="cover_image" accept="image/*" onChange={handleFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  </div>

                  <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-lg border border-dashed border-gray-600">
                    <label className="block text-sm font-bold text-white mb-2">🎬 Fichier Vidéo (MP4, MKV...) {currentMovie && '(Laissez vide pour conserver)'}</label>
                    <input type="file" name="video_file" accept="video/*" onChange={handleFileChange}
                      className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer" />
                  </div>
                </div>

              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-800 bg-gray-900 rounded-b-xl flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={closeModal} disabled={isSubmitting}
                className="px-4 py-2 rounded-md font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition disabled:opacity-50">
                Annuler
              </button>
              <button type="submit" form="movie-form" disabled={isSubmitting}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Upload en cours...
                  </>
                ) : 'Enregistrer le film'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Movies;