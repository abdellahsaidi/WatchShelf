import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand & Description */}
        <div>
          <h2 className="text-2xl font-black text-red-600 tracking-wider mb-4">
            WATCHSHELF
          </h2>
          <p className="text-sm leading-relaxed">
            Your ultimate destination for discovering movies, series, and anime. 
            Track, rate, and save your favorite content easily.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white transition">Explore Catalogue</Link></li>
            <li><Link to="/collections" className="hover:text-white transition">My Collections</Link></li>
          </ul>
        </div>

        {/* Legal & Support */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Legal</h3>
          <ul className="space-y-2 text-sm font-medium">
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
          </ul>
        </div>

      </div>

      {/* Copyright Bottom */}
      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-center text-sm">
        <p>&copy; {currentYear} WatchShelf. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;