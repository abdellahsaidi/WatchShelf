import { useState, useEffect } from 'react';
import api from '../../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_movies: 0,
    total_series: 0,
    total_views: 0,
    recent_users: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Remplace par ton vrai endpoint Django pour les statistiques admin
        const response = await api.get('/admin/stats/');
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
        // Fallback mock data pour tester l'UI si l'API n'est pas encore prête
        setStats({
          total_users: 124,
          total_movies: 845,
          total_series: 132,
          total_views: 15420,
          recent_users: [
            { id: 1, username: 'karim_dz', email: 'karim@test.com', joined: '2 hours ago' },
            { id: 2, username: 'sarah.99', email: 'sarah@test.com', joined: '5 hours ago' },
            { id: 3, username: 'amine_dev', email: 'amine@test.com', joined: '1 day ago' },
          ]
        });
        setError("L'API des stats n'est pas encore connectée. Affichage des données de test.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto w-full">
      
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back to the admin panel. Here's what's happening today.</p>
      </div>

      {error && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 px-4 py-3 rounded-md text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Users Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Users</h3>
            <span className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">👤</span>
          </div>
          {isLoading ? (
             <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{stats.total_users}</p>
          )}
        </div>

        {/* Movies Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Movies</h3>
            <span className="p-2 bg-red-500/20 text-red-500 rounded-lg">🎬</span>
          </div>
          {isLoading ? (
             <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{stats.total_movies}</p>
          )}
        </div>

        {/* Series Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Series</h3>
            <span className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">📺</span>
          </div>
          {isLoading ? (
             <div className="h-8 bg-gray-700 rounded w-16 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{stats.total_series}</p>
          )}
        </div>

        {/* Views Card */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 font-medium">Total Views</h3>
            <span className="p-2 bg-green-500/20 text-green-500 rounded-lg">👁️</span>
          </div>
          {isLoading ? (
             <div className="h-8 bg-gray-700 rounded w-24 animate-pulse"></div>
          ) : (
            <p className="text-3xl font-bold text-white">{stats.total_views.toLocaleString()}</p>
          )}
        </div>

      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Users Table */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/80 flex justify-between items-center">
            <h3 className="font-bold text-white">Recent Signups</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-900/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : stats.recent_users.length > 0 ? (
                  stats.recent_users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                          {user.username[0].toUpperCase()}
                        </div>
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No recent signups.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / System Health */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/80">
            <h3 className="font-bold text-white">System Status</h3>
          </div>
          <div className="p-6 space-y-6">
            
            {/* API Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Backend API</p>
                <p className="text-sm text-gray-400">Django REST Framework</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            {/* DB Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Database</p>
                <p className="text-sm text-gray-400">PostgreSQL / Cassandra</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            {/* Storage Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Media Storage</p>
                <p className="text-sm text-gray-400">Video & Image uploads</p>
              </div>
              <div className="w-1/3 bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;