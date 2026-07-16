from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
    TokenBlacklistView,
)

from core.views import AddCommentView, AddToCollectionView, AdminCommentDeleteView, AdminDashboardStatsView, AdminEpisodeCreateView, AdminEpisodeDetailView, AdminGenreCreateView, AdminGenreDetailView, AdminLoginView, AdminMovieCreateView, AdminMovieDetailView, AdminSeasonCreateView, AdminSeriesCreateView, AdminSeriesDetailView, CollectionListView, CreateCollectionView, DeleteCollectionView, EpisodeDetailView, FilterContentView, GenreListView, GlobalSearchView, ListCommentsView, ListFavoritesView, ListHistoryView, LoginView, LogoutView, MovieDetailView, MovieListView, RateContentView, RegisterView, SeriesDetailView, SeriesListView, ToggleFavoriteView, ToggleLikeView, TrendingView, UpdateHistoryView, UserProfileUpdateView, UserProfileView

urlpatterns = [
    # JWT Authentication
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("token/blacklist/", TokenBlacklistView.as_view(), name="token_blacklist"),

    #user URLS
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('genres/', GenreListView.as_view(), name='genre_list'),
    path('movies/', MovieListView.as_view(), name='movie_list'),
    path('movies/<slug:slug>/', MovieDetailView.as_view(), name='movie_detail'),
    path('series/', SeriesListView.as_view(), name='series_list'),
    path('series/<slug:slug>/', SeriesDetailView.as_view(), name='series_detail'),
    path('series/<slug:slug>/saison-<int:season_number>/ep-<int:episode_number>/', EpisodeDetailView.as_view(), name='episode_detail'),
    path('trending/', TrendingView.as_view(), name='trending'),
    path('search/', GlobalSearchView.as_view(), name='search'),
    path('filter/', FilterContentView.as_view(), name='filter'),
    path('interactions/comment/', AddCommentView.as_view(), name='add_comment'),
    path('interactions/comments/', ListCommentsView.as_view(), name='list_comments'),
    path('interactions/like/', ToggleLikeView.as_view(), name='toggle_like'),
    path('interactions/rate/', RateContentView.as_view(), name='rate_content'),
    path('interactions/favorite/', ToggleFavoriteView.as_view(), name='toggle_favorite'),
    path('interactions/favorites/', ListFavoritesView.as_view(), name='list_favorites'),
    path('history/update/', UpdateHistoryView.as_view(), name='update_history'),
    path('history/', ListHistoryView.as_view(), name='list_history'),
    path('collections/', CollectionListView.as_view(), name='list_collections'),
    path('collections/create/', CreateCollectionView.as_view(), name='create_collection'),
    path('collections/<int:id>/add/', AddToCollectionView.as_view(), name='add_to_collection'),
    path('collections/<int:id>/', DeleteCollectionView.as_view(), name='delete_collection'),

    #manager URLS
    path('admin/auth/login/', AdminLoginView.as_view(), name='admin_login'),
    path('admin/genres/', AdminGenreCreateView.as_view(), name='admin_genre_create'),
    path('admin/genres/<int:id>/', AdminGenreDetailView.as_view(), name='admin_genre_detail'),
    path('admin/movies/', AdminMovieCreateView.as_view(), name='admin_movie_create'),
    path('admin/movies/<int:id>/', AdminMovieDetailView.as_view(), name='admin_movie_detail'),
    path('admin/series/', AdminSeriesCreateView.as_view(), name='admin_series_create'),
    path('admin/series/<int:id>/', AdminSeriesDetailView.as_view(), name='admin_series_detail'),
    path('admin/seasons/', AdminSeasonCreateView.as_view(), name='admin_season_create'),
    path('admin/episodes/', AdminEpisodeCreateView.as_view(), name='admin_episode_create'),
    path('admin/episodes/<int:id>/', AdminEpisodeDetailView.as_view(), name='admin_episode_detail'),
    path('admin/comments/<int:id>/', AdminCommentDeleteView.as_view(), name='admin_comment_delete'),
    path('admin/dashboard/stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),

]
