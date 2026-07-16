import { useState, useContext } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Genres', path: '/admin/genres', icon: '🏷️' },
    { name: 'Movies', path: '/admin/movies', icon: '🎬' },
    { name: 'Series & Anime', path: '/admin/series', icon: '📺' },
    { name: 'Episodes', path: '/admin/episodes', icon: '📑' },
    { name: 'Moderation', path: '/admin/moderation', icon: '🛡️' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <h2 className="text-2xl font-black text-red-600 tracking-wider">
            ADMIN PANEL
          </h2>
        </div>

        <nav className="flex-grow overflow-y-auto py-6 px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-red-600/10 text-red-500 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="text-xl">🌍</span>
            <span className="font-medium">Back to Site</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white focus:outline-none mr-4"
            >
              <span className="text-2xl">☰</span>
            </button>
            <h1 className="text-xl font-bold text-gray-200 hidden sm:block">
              WatchShelf Management
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-right hidden sm:block">
              <p className="font-bold text-white">{user?.username || 'Admin'}</p>
              <p className="text-red-500 text-xs">Superuser</p>
            </div>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-800 shadow-md">
              {user?.username ? user.username[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-950">
          <Outlet />
        </main>
        
      </div>

    </div>
  );
};

export default AdminLayout;