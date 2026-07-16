import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';

// ==========================================
// 🧩 LAYOUTS & COMPOSANTS GLOBAUX
// ==========================================
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// ==========================================
// 🚪 PAGES D'AUTHENTIFICATION
// ==========================================
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ==========================================
// 🌍 PAGES PUBLIQUES (Découverte)
// ==========================================
import Home from './pages/Home';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Search from './pages/Search';
import MovieDetails from './pages/MovieDetails';
import SeriesDetails from './pages/SeriesDetails';

// ==========================================
// 👤 PAGES UTILISATEUR
// ==========================================
import Profile from './pages/user/Profile';
import Favorites from './pages/user/Favorites';
import History from './pages/user/History';
import Collections from './pages/user/Collections';
import CollectionDetails from './pages/user/CollectionDetails';

// ==========================================
// 👑 PAGES ADMIN (Avec Alias pour éviter les conflits)
// ==========================================
import Dashboard from './pages/admin/Dashboard';
import Genres from './pages/admin/Genres';
import AdminMovies from './pages/admin/Movies';
import AdminSeries from './pages/admin/Series';
import Episodes from './pages/admin/Episodes';
import Moderation from './pages/admin/Moderation';

// ==========================================
// 🛡️ GUARDS (Sécurité des routes)
// ==========================================

// Protège les pages de l'espace utilisateur
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Protège les pages du Dashboard Admin
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div></div>;
  if (!user || (!user.is_staff && !user.is_superuser)) return <Navigate to="/" replace />;
  return children;
};

// ==========================================
// 🏗️ MAIN LAYOUT (Navbar + Contenu + Footer)
// ==========================================
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-200 font-sans selection:bg-red-500/30 selection:text-red-200">
      <Navbar />
      {/* pt-16 ou mt-16 si ta Navbar est en position fixed/sticky */}
      <main className="flex-grow flex flex-col pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// ==========================================
// 🚀 APPLICATION ROOT
// ==========================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* 🚪 ROUTES PUBLIQUES (SANS NAVBAR/FOOTER) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 🔒 ROUTES PROTÉGÉES (AVEC NAVBAR/FOOTER) */}
          {/* On englobe TOUT le MainLayout avec ProtectedRoute */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            
            {/* Le Catalogue (Désormais privé) */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/series" element={<Series />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movies/:slug" element={<MovieDetails />} />
            <Route path="/series/:slug" element={<SeriesDetails />} />

            {/* L'Espace Utilisateur */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/history" element={<History />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:id" element={<CollectionDetails />} />
            
          </Route>

          {/* 👑 ROUTES DASHBOARD ADMIN */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="genres" element={<Genres />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="series" element={<AdminSeries />} />
            <Route path="episodes" element={<Episodes />} />
            <Route path="moderation" element={<Moderation />} />
          </Route>

          {/* CATCH ALL (Page 404 - Redirige vers Home, qui redirigera vers Login si non connecté) */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;