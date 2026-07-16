from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Genre, Movie, Series, Season, Episode, 
    Comment, Like, Rating, Favorite, WatchHistory, 
    Collection, CollectionItem
)

# ==========================================
# 1. UTILISATEURS
# ==========================================
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    On étend l'admin natif de Django pour inclure nos champs personnalisés (avatar, bio).
    """
    fieldsets = UserAdmin.fieldsets + (
        ('Informations Supplémentaires', {'fields': ('avatar', 'bio')}),
    )
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email')

# ==========================================
# 2. GENRES
# ==========================================
@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)

# ==========================================
# 3. CONTENU PRINCIPAL
# ==========================================
@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('title', 'release_date', 'rating', 'views', 'video_type')
    list_filter = ('video_type', 'genres')
    search_fields = ('title', 'description')
    # Y'rempli le slug automatiquement f'l'admin ki tekteb le titre
    prepopulated_fields = {'slug': ('title',)} 

@admin.register(Series)
class SeriesAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'release_date', 'rating', 'views')
    list_filter = ('type', 'genres')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):
    list_display = ('series', 'season_number', 'title')
    list_filter = ('series',)
    search_fields = ('series__title', 'title')

@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('season', 'episode_number', 'title', 'duration', 'views', 'video_type')
    list_filter = ('season__series', 'video_type')
    search_fields = ('title', 'description', 'season__series__title')

# ==========================================
# 4. INTERACTIONS & HISTORY
# ==========================================
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'created_at')
    list_filter = ('content_type',)
    search_fields = ('user__username', 'content')

@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'created_at')
    list_filter = ('content_type',)

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'score', 'created_at')
    list_filter = ('score', 'content_type')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'created_at')
    list_filter = ('content_type',)

@admin.register(WatchHistory)
class WatchHistoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'progress', 'watched_at')
    list_filter = ('content_type',)

# ==========================================
# 5. COLLECTIONS
# ==========================================
@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')

@admin.register(CollectionItem)
class CollectionItemAdmin(admin.ModelAdmin):
    list_display = ('collection', 'content_type', 'object_id')