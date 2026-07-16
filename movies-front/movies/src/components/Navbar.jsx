import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Desktop Links */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-black text-red-600 tracking-wider">
              WATCHSHELF
            </Link>
            
            <div className="hidden md:flex space-x-6 font-medium text-gray-300">
              <Link to="/" className="hover:text-white transition">Home</Link>
              <Link to="/explore" className="hover:text-white transition">Explore</Link>
              <Link to="/collections" className="hover:text-white transition">Collections</Link>
            </div>
          </div>

          {/* Search & Auth (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Search movies..." 
                className="bg-gray-800 text-sm text-white rounded-full pl-4 pr-10 py-2 focus:outline-none focus:ring-1 focus:ring-red-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-2 text-gray-400 hover:text-white">
                🔍
              </button>
            </form>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                {/* Avatar Toggle */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center focus:outline-none"
                >
                  <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center font-bold text-lg hover:ring-2 hover:ring-gray-400 transition">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                  </div>
                </button>

                {/* User Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-gray-800 rounded-md shadow-xl py-2 border border-gray-700">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>My Profile</Link>
                    <Link to="/favorites" className="block px-4 py-2 hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>Favorites</Link>
                    <Link to="/history" className="block px-4 py-2 hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>History</Link>
                    
                    {/* Admin Link */}
                    {(user.is_staff || user.is_superuser) && (
                       <Link to="/admin/dashboard" className="block px-4 py-2 text-red-500 hover:bg-gray-700 transition" onClick={() => setIsDropdownOpen(false)}>Admin Panel</Link>
                    )}
                    
                    <hr className="border-gray-700 my-1" />
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 transition">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4 font-medium">
                <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
                <Link to="/register" className="bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition shadow-lg">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none text-2xl">
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 pt-2 pb-6 space-y-3 shadow-xl">
           <form onSubmit={handleSearch} className="relative mb-4">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-800 text-sm rounded-md px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
          <Link to="/" className="block text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/explore" className="block text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
          
          {user ? (
            <>
              <div className="pt-4 border-t border-gray-800">
                <Link to="/profile" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <Link to="/favorites" className="block py-2 text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Favorites</Link>
                
                {(user.is_staff || user.is_superuser) && (
                   <Link to="/admin/dashboard" className="block py-2 text-red-500 hover:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                )}
                
                <button onClick={handleLogout} className="block w-full text-left py-2 mt-2 text-gray-400 hover:text-white">Logout</button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-4 border-t border-gray-800">
              <Link to="/login" className="block text-center py-2 text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="bg-red-600 text-center py-2 rounded-md text-white hover:bg-red-700" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;