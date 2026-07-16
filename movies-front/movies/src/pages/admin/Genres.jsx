import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGenre, setCurrentGenre] = useState(null); // null = Create, object = Edit
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Genres
  const fetchGenres = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/genres/');
      // Adjust if API returns paginated data (response.data.results)
      setGenres(response.data.results || response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError("Impossible de charger les genres.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Open Modal for Create or Edit
  const openModal = (genre = null) => {
    if (genre) {
      setCurrentGenre(genre);
      setFormData({ name: genre.name, description: genre.description || '' });
    } else {
      setCurrentGenre(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentGenre(null);
    setFormData({ name: '', description: '' });
  };

  // Handle Form Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentGenre) {
        // UPDATE
        const response = await api.put(`/genres/${currentGenre.id}/`, formData);
        setGenres(genres.map(g => g.id === currentGenre.id ? response.data : g));
      } else {
        // CREATE
        const response = await api.post('/genres/', formData);
        setGenres([...genres, response.data]);
      }
      closeModal();
    } catch (err) {
      console.error('Error saving genre:', err);
      alert("Erreur lors de la sauvegarde du genre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce genre ?")) return;

    try {
      await api.delete(`/genres/${id}/`);
      setGenres(genres.filter(g => g.id !== id));
    } catch (err) {
      console.error('Error deleting genre:', err);
      alert("Erreur lors de la suppression.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des Genres</h1>
          <p className="text-gray-400 mt-1">Créez, modifiez et supprimez les catégories de contenu.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-red-600 text-white px-5 py-2 rounded-md font-medium hover:bg-red-700 transition shadow-lg flex items-center gap-2"
        >
          <span>+</span> Ajouter un Genre
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Genres Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nom du Genre</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : genres.length > 0 ? (
                genres.map((genre) => (
                  <tr key={genre.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono">#{genre.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{genre.name}</td>
                    <td className="px-6 py-4 text-gray-400 truncate max-w-xs">
                      {genre.description || "Aucune description"}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button 
                        onClick={() => openModal(genre)}
                        className="text-blue-400 hover:text-blue-300 transition font-medium"
                      >
                        Éditer
                      </button>
                      <button 
                        onClick={() => handleDelete(genre.id)}
                        className="text-red-500 hover:text-red-400 transition font-medium"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                    Aucun genre trouvé. Commencez par en ajouter un.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {currentGenre ? 'Modifier le Genre' : 'Ajouter un Genre'}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-white transition text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom du Genre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="ex: Action, Comédie..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none"
                  placeholder="Optionnel..."
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-md font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Genres;