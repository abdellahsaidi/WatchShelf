import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

const Comments = ({ contentId, contentType }) => {
  const { user } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!contentId) return;
    api.get(`/interactions/comments/`, { params: { content_id: contentId, content_type: contentType } })
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [contentId, contentType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await api.post('/interactions/comments/', { content_id: contentId, content_type: contentType, text: newComment });
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) { console.error(error); }
  };

  return (
    <div className="mt-12 w-full">
      <h3 className="text-2xl font-bold text-white mb-6">Comments ({comments.length})</h3>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 flex flex-col items-end">
          <textarea className="w-full bg-gray-800/50 text-white p-4 border border-gray-700 focus:border-red-500 rounded" rows="3" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..."></textarea>
          <button type="submit" className="mt-3 px-6 py-2 bg-red-600 text-white rounded">Post</button>
        </form>
      ) : (
        <div className="mb-10 text-center p-6 border border-gray-700 rounded"><Link to="/login" className="text-red-500">Sign in to comment</Link></div>
      )}
      <div className="space-y-6">
        {comments.map(c => (
          <div key={c.id} className="bg-gray-800/30 p-4 rounded border border-gray-700/50">
            <span className="font-bold text-gray-200">{c.username}</span>
            <p className="text-gray-300 text-sm mt-2">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;