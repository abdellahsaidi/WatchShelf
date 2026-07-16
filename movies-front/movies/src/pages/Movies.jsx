import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Card';

const Movies = () => {
  // State for data
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  
  // State for pagination and loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for filters
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    ordering: '-release_date' // Default sort: newest first
  });

  // Fetch genres on component mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get('/genres/');
        setGenres(response.data);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies whenever filters or page change
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build query string dynamically
        const params = new URLSearchParams({
          page: page,
          ...(filters.genre && { genre: filters.genre }),
          ...(filters.year && { year: filters.year }),
          ...(filters.ordering && { ordering: filters.ordering })
        });

        const response = await api.get(`/movies/?${params.toString()}`);
        
        // Assuming Django REST framework standard pagination response
        if (response.data.results) {
          setMovies(response.data.results);
          // Calculate total pages (assuming page_size is 20 in Django)
          setTotalPages(Math.ceil(response.data.count / 20));
        } else {
          // Fallback if pagination is not configured
          setMovies(response.data);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPage(1); // Reset to page 1 when filters change
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-10 w-full">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-gray-800 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Movies</h1>
          <p className="text-gray-400 mt-2">Discover and filter our entire movie collection.</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Genre Filter */}
          <select
            name="genre"
            value={filters.genre}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Genres</option>
            {genres.map(genre => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>

          {/* Sort Filter */}
          <select
            name="ordering"
            value={filters.ordering}
            onChange={handleFilterChange}
            className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:border-red-500"
          >
            <option value="-release_date">Newest First</option>
            <option value="release_date">Oldest First</option>
            <option value="-rating">Top Rated</option>
          </select>
          
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded text-center">
          {error}
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="text-center py-20">
          <p className="text-2xl text-gray-500">No movies found matching your criteria.</p>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && !error && movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
            {movies.map((movie) => (
              <Card key={movie.id} item={movie} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-6 border-t border-gray-800">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition border border-gray-700"
              >
                Previous
              </button>
              <span className="text-gray-400 font-medium text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition border border-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Movies;