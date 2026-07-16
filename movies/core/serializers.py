from rest_framework import serializers
from django.contrib.auth import get_user_model

from core.models import Genre, Movie ,Comment

User = get_user_model()

# user SERIALIZERS

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True} # L'utilisateur ne pourra pas lire le mot de passe
        }

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar', 'bio')
        read_only_fields = ('id', 'username', 'email')

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name')

class MovieListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = ('id', 'title', 'slug', 'poster', 'rating', 'release_date', 'duration', 'genres')


class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Movie
        fields = (
            'id', 'title', 'slug', 'description', 'release_date', 'duration', 
            'rating', 'views', 'poster', 'cover_image', 'trailer_url', 
            'video_type', 'video_file', 'external_video_url', 'genres', 'created_at'
        )

from .models import Collection, Series, Season, Episode

class SeriesListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = ('id', 'title', 'slug', 'type', 'poster', 'rating', 'release_date', 'genres')


class EpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = (
            'id', 'episode_number', 'title', 'description', 'duration', 
            'views', 'video_type', 'video_file', 'external_video_url', 'created_at'
        )


class SeasonSerializer(serializers.ModelSerializer):
    episodes = EpisodeSerializer(many=True, read_only=True)

    class Meta:
        model = Season
        fields = ('id', 'season_number', 'title', 'description', 'episodes')


class SeriesDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    seasons = SeasonSerializer(many=True, read_only=True)

    class Meta:
        model = Series
        fields = (
            'id', 'title', 'slug', 'type', 'description', 'release_date', 
            'rating', 'views', 'poster', 'cover_image', 'trailer_url', 
            'genres', 'seasons', 'created_at'
        )

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.ImageField(source='user.avatar', read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'username', 'avatar', 'content', 'created_at')

class CollectionSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ('id', 'name', 'description', 'created_at', 'items_count')

    def get_items_count(self, obj):
        return obj.items.count()
    

# Manager SERIALIZERS

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

class AdminMovieSerializer(serializers.ModelSerializer):
    genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), required=False)

    class Meta:
        model = Movie
        fields = (
            'id', 'title', 'slug', 'description', 'release_date', 'duration',
            'rating', 'poster', 'cover_image', 'trailer_url',
            'video_type', 'video_file', 'external_video_url', 'genres'
        )
        read_only_fields = ('id', 'slug')

class AdminSeriesSerializer(serializers.ModelSerializer):
    genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), required=False)

    class Meta:
        model = Series
        fields = (
            'id', 'title', 'slug', 'type', 'description', 'release_date', 
            'rating', 'poster', 'cover_image', 'trailer_url', 'genres'
        )
        read_only_fields = ('id', 'slug')

class AdminSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = ('id', 'series', 'season_number', 'title', 'description')

class AdminEpisodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Episode
        fields = (
            'id', 'season', 'episode_number', 'title', 'description', 
            'duration', 'video_type', 'video_file', 'external_video_url'
        )