import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Moderation = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all comments for moderation
  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      try {
        // Endpoint admin pour récupérer TOUS les commentaires (ajuste selon ton backend)
        const response = await api.get('/admin/comments/');
        setComments(response.data.results || response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError("Impossible de charger les commentaires.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, []);

  // Handle Delete Comment
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ? Cette action est irréversible.")) return;

    try {
      // Ajuste l'endpoint selon ta config Django
      await api.delete(`/interactions/comments/${id}/`);
      setComments(comments.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert("Erreur lors de la suppression du commentaire.");
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      {/* Page Header */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Modération des Commentaires</h1>
        <p className="text-gray-400 mt-1">Supervisez les interactions des utilisateurs et supprimez le contenu inapproprié.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Comments Table */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-900/80 text-gray-400 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold w-1/4">Utilisateur & Date</th>
                <th className="px-6 py-4 font-semibold w-1/5">Contenu Visé</th>
                <th className="px-6 py-4 font-semibold w-2/5">Commentaire</th>
                <th className="px-6 py-4 font-semibold text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </td>
                </tr>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-700/30 transition-colors">
                    
                    {/* User Info & Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                          {comment.username ? comment.username[0].toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-white">{comment.username}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-11">
                        {formatDate(comment.created_at)}
                      </div>
                    </td>

                    {/* Target Content */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300 font-medium mb-1 uppercase">
                        {comment.content_type}
                      </span>
                      <p className="text-gray-400 text-xs font-semibold truncate max-w-[150px]" title={comment.content_title}>
                        ID: {comment.content_id}
                      </p>
                    </td>

                    {/* Comment Text */}
                    <td className="px-6 py-4">
                      <p className="text-gray-300 bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 line-clamp-3 hover:line-clamp-none transition-all">
                        {comment.text}
                      </p>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white px-4 py-2 rounded-md font-medium transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <span className="text-4xl block mb-3">🛡️</span>
                    <p className="text-gray-400 text-lg">Aucun commentaire à modérer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Moderation;