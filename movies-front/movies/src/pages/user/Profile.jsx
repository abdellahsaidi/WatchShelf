import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      // Adjust endpoint if your Django URL is different (e.g., /auth/users/me/)
      await api.patch('/auth/profile/', formData);
      
      setStatus({ 
        type: 'success', 
        message: 'Profile updated successfully! Refresh to see changes globally.' 
      });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 py-10 w-full">
      
      <div className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-2">Manage your account details and personal information.</p>
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 md:p-10 backdrop-blur-sm">
        
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-700">
          <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center font-bold text-4xl text-white shadow-lg">
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white">{user?.username || 'User'}</h2>
            <p className="text-gray-400">{user?.email || 'No email provided'}</p>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wider font-semibold">
              {(user?.is_staff || user?.is_superuser) ? 'Admin Account' : 'Standard Member'}
            </p>
          </div>
        </div>

        {/* Status Alerts */}
        {status.message && (
          <div className={`mb-6 p-4 rounded-md text-sm border ${
            status.type === 'success' 
              ? 'bg-green-500/10 border-green-500/50 text-green-400' 
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}>
            {status.message}
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-900 border border-gray-700 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || (!formData.username && !formData.email)}
              className="bg-red-600 text-white px-8 py-3 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Saving changes...' : 'Save Changes'}
            </button>
          </div>
          
        </form>
      </div>

    </div>
  );
};

export default Profile;