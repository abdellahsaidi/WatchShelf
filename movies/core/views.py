from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny , IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.pagination import PageNumberPagination
from django.db.models import OuterRef, Subquery, Count, F, FloatField, ExpressionWrapper, Q
from django.db.models.functions import Coalesce
from core.models import Collection, CollectionItem, Episode, Genre, Like, Movie, Series , Comment ,Like, Rating ,Favorite, WatchHistory, WatchHistory
from .serializers import AdminEpisodeSerializer, AdminLoginSerializer, AdminMovieSerializer, AdminMovieSerializer, AdminSeasonSerializer, AdminSeriesSerializer, CollectionSerializer, CommentSerializer, EpisodeSerializer, GenreSerializer, MovieDetailSerializer, MovieListSerializer, SeriesDetailSerializer, SeriesListSerializer, UserProfileSerializer, UserSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.permissions import IsAdminUser
from django.utils.text import slugify
from django.db.models import Sum

User = get_user_model()

# user VIEWS

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', '')
            )
            return Response({
                'message': 'Compte créé avec succès.',
                'user_id': user.id
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_staff': user.is_staff,
                    'is_superuser': user.is_superuser
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Identifiants incorrects.'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            return Response({
                'message': 'Profile updated successfully.',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if not refresh_token:
                return Response(
                    {"error": "Le refresh token est requis."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response(
                {"message": "Déconnexion réussie."}, 
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {"error": "Token invalide ou déjà expiré."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class GenreListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        genres = Genre.objects.all().order_by('name')
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class MovieListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movies = Movie.objects.all().order_by('-created_at')

        genre = request.query_params.get('genre')
        year = request.query_params.get('year')
        search = request.query_params.get('search')
        if genre:
            movies = movies.filter(genres__name__icontains=genre)
        if year:
            movies = movies.filter(release_date__year=year)
        if search:
            movies = movies.filter(Q(title__icontains=search) | Q(description__icontains=search))

        paginator = PageNumberPagination()
        paginator.page_size = 12  # Nombre de films par page
        paginated_movies = paginator.paginate_queryset(movies, request)
        
        serializer = MovieListSerializer(paginated_movies, many=True)
        return paginator.get_paginated_response(serializer.data)


class MovieDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            movie = Movie.objects.get(slug=slug)
            serializer = MovieDetailSerializer(movie)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Movie.DoesNotExist:
            return Response(
                {"error": "Film introuvable."}, 
                status=status.HTTP_404_NOT_FOUND
            )

class SeriesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        series = Series.objects.all().order_by('-created_at')
        series_type = request.query_params.get('type') 
        genre = request.query_params.get('genre')
        year = request.query_params.get('year')
        search = request.query_params.get('search')
        if series_type:
            series = series.filter(type=series_type)
        if genre:
            series = series.filter(genres__name__icontains=genre)
        if year:
            series = series.filter(release_date__year=year)
        if search:
            series = series.filter(Q(title__icontains=search) | Q(description__icontains=search))
        paginator = PageNumberPagination()
        paginator.page_size = 12
        paginated_series = paginator.paginate_queryset(series, request)
        serializer = SeriesListSerializer(paginated_series, many=True)
        return paginator.get_paginated_response(serializer.data)


class SeriesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            series = Series.objects.get(slug=slug)
            serializer = SeriesDetailSerializer(series)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Series.DoesNotExist:
            return Response(
                {"error": "Série ou Anime introuvable."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class EpisodeDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug, season_number, episode_number):
        try:
            episode = Episode.objects.get(
                season__series__slug=slug,
                season__season_number=season_number,
                episode_number=episode_number
            )
            serializer = EpisodeSerializer(episode)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Episode.DoesNotExist:
            return Response(
                {"error": "Épisode introuvable."}, 
                status=status.HTTP_404_NOT_FOUND
            )




class TrendingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movie_ct = ContentType.objects.get_for_model(Movie)
        series_ct = ContentType.objects.get_for_model(Series)

        movie_likes = Like.objects.filter(content_type=movie_ct, object_id=OuterRef('pk')).values('object_id').annotate(count=Count('id')).values('count')
        series_likes = Like.objects.filter(content_type=series_ct, object_id=OuterRef('pk')).values('object_id').annotate(count=Count('id')).values('count')

        movies = Movie.objects.annotate(
            likes_count=Coalesce(Subquery(movie_likes), 0)
        ).annotate(
            trending_score=ExpressionWrapper(
                (F('views') * 0.5) + (F('rating') * 0.3) + (F('likes_count') * 0.2),
                output_field=FloatField()
            )
        ).order_by('-trending_score')[:10]

        series = Series.objects.annotate(
            likes_count=Coalesce(Subquery(series_likes), 0)
        ).annotate(
            trending_score=ExpressionWrapper(
                (F('views') * 0.5) + (F('rating') * 0.3) + (F('likes_count') * 0.2),
                output_field=FloatField()
            )
        ).order_by('-trending_score')[:10]

        return Response({
            "trending_movies": MovieListSerializer(movies, many=True).data,
            "trending_series": SeriesListSerializer(series, many=True).data
        }, status=status.HTTP_200_OK)


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '')
        
        if not query:
            return Response({"movies": [], "series": []}, status=status.HTTP_200_OK)

        movies = Movie.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))[:15]
        series = Series.objects.filter(Q(title__icontains=query) | Q(description__icontains=query))[:15]

        return Response({
            "movies": MovieListSerializer(movies, many=True).data,
            "series": SeriesListSerializer(series, many=True).data
        }, status=status.HTTP_200_OK)


class FilterContentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        category = request.query_params.get('category')
        genre = request.query_params.get('genre')

        movies = Movie.objects.all()
        series = Series.objects.all()

        if genre:
            movies = movies.filter(genres__name__icontains=genre)
            series = series.filter(genres__name__icontains=genre)

        if category == 'MOVIE':
            # Retourne JUSTE les films
            return Response({"results": MovieListSerializer(movies, many=True).data})
            
        elif category == 'SERIES':
            return Response({"results": SeriesListSerializer(series, many=True).data})
            
        elif category in ['TV_SHOW', 'ANIME']:
            series = series.filter(type=category)
            return Response({"results": SeriesListSerializer(series, many=True).data})
            
        else:
            return Response({
                "movies": MovieListSerializer(movies, many=True).data,
                "series": SeriesListSerializer(series, many=True).data
            })

class AddCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model_type = request.data.get('content_type') 
        object_id = request.data.get('object_id')
        content = request.data.get('content')

        if not all([model_type, object_id, content]):
            return Response(
                {"error": "Les champs content_type, object_id et content sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response(
                {"error": "Type de contenu invalide (utilisez 'movie', 'series' ou 'episode')."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        comment = Comment.objects.create(
            user=request.user,
            content_type=content_type_obj,
            object_id=object_id,
            content=content
        )

        return Response({
            "message": "Commentaire ajouté avec succès.",
            "comment": CommentSerializer(comment).data
        }, status=status.HTTP_201_CREATED)


class ListCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        model_type = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')

        if not all([model_type, object_id]):
            return Response(
                {"error": "Les paramètres content_type et object_id sont requis dans l'URL."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        comments = Comment.objects.filter(
            content_type__model=model_type.lower(),
            object_id=object_id
        ).order_by('-created_at')

        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model_type = request.data.get('content_type')
        object_id = request.data.get('object_id')

        if not all([model_type, object_id]):
            return Response(
                {"error": "Les champs content_type et object_id sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response(
                {"error": "Type de contenu invalide (utilisez 'movie', 'series' ou 'episode')."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        like_qs = Like.objects.filter(
            user=request.user,
            content_type=content_type_obj,
            object_id=object_id
        )

        if like_qs.exists():
            like_qs.delete()
            return Response({
                "message": "Like retiré avec succès.", 
                "liked": False
            }, status=status.HTTP_200_OK)
        else:
            Like.objects.create(
                user=request.user,
                content_type=content_type_obj,
                object_id=object_id
            )
            return Response({
                "message": "Like ajouté avec succès.", 
                "liked": True
            }, status=status.HTTP_201_CREATED)

class RateContentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        score = request.data.get('score')

        if not all([model_type, object_id, score]):
            return Response(
                {"error": "Les champs content_type, object_id et score sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            score = int(score)
            if score < 1 or score > 10:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"error": "Le score doit être un nombre entier entre 1 et 10."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response(
                {"error": "Type de contenu invalide."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            content_type=content_type_obj,
            object_id=object_id,
            defaults={'score': score}
        )

        if created:
            message = "Note ajoutée avec succès."
            status_code = status.HTTP_201_CREATED
        else:
            message = "Note mise à jour avec succès."
            status_code = status.HTTP_200_OK

        return Response({
            "message": message,
            "score": rating.score
        }, status=status_code)
    
class ToggleFavoriteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model_type = request.data.get('content_type')
        object_id = request.data.get('object_id')

        if not all([model_type, object_id]):
            return Response(
                {"error": "Les champs content_type et object_id sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response(
                {"error": "Type de contenu invalide (utilisez 'movie', 'series' ou 'episode')."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        favorite_qs = Favorite.objects.filter(
            user=request.user,
            content_type=content_type_obj,
            object_id=object_id
        )

        if favorite_qs.exists():
            favorite_qs.delete()
            return Response({
                "message": "Retiré des favoris.", 
                "is_favorite": False
            }, status=status.HTTP_200_OK)
        else:
            Favorite.objects.create(
                user=request.user,
                content_type=content_type_obj,
                object_id=object_id
            )
            return Response({
                "message": "Ajouté aux favoris.", 
                "is_favorite": True
            }, status=status.HTTP_201_CREATED)


class ListFavoritesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).prefetch_related('content_object').order_by('-created_at')

        results = []
        for fav in favorites:
            item = getattr(fav, 'content_object', None)
            if not item:
                continue

            if fav.content_type.model == 'movie':
                data = MovieListSerializer(item).data
                content_type_label = 'movie'
            elif fav.content_type.model == 'series':
                data = SeriesListSerializer(item).data
                content_type_label = 'series'
            elif fav.content_type.model == 'episode':
                data = EpisodeSerializer(item).data
                content_type_label = 'episode'
            else:
                continue

            results.append({
                "favorite_id": fav.id,
                "added_at": fav.created_at,
                "content_type": content_type_label,
                "item": data
            })

        return Response({"results": results}, status=status.HTTP_200_OK)
    
class UpdateHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        model_type = request.data.get('content_type')
        object_id = request.data.get('object_id')
        progress = request.data.get('progress')

        if not all([model_type, object_id]) or progress is None:
            return Response(
                {"error": "Les champs content_type, object_id et progress sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            progress = int(progress)
            if progress < 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {"error": "Le champ progress doit être un nombre entier positif (secondes)."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response(
                {"error": "Type de contenu invalide."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        history, created = WatchHistory.objects.update_or_create(
            user=request.user,
            content_type=content_type_obj,
            object_id=object_id,
            defaults={'progress': progress}
        )

        return Response({
            "message": "Historique mis à jour.",
            "progress": history.progress
        }, status=status.HTTP_200_OK)


class ListHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        history_qs = WatchHistory.objects.filter(user=request.user).prefetch_related('content_object').order_by('-watched_at')

        results = []
        for history in history_qs:
            item = getattr(history, 'content_object', None)
            if not item:
                continue

            if history.content_type.model == 'movie':
                data = MovieListSerializer(item).data
                content_type_label = 'movie'
            elif history.content_type.model == 'episode':
                data = EpisodeSerializer(item).data
                content_type_label = 'episode'
            elif history.content_type.model == 'series':
                data = SeriesListSerializer(item).data
                content_type_label = 'series'
            else:
                continue

            results.append({
                "history_id": history.id,
                "progress": history.progress,
                "watched_at": history.watched_at,
                "content_type": content_type_label,
                "item": data
            })

        return Response({"results": results}, status=status.HTTP_200_OK)

class CollectionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        collections = Collection.objects.filter(user=request.user).order_by('-created_at')
        serializer = CollectionSerializer(collections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CreateCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')

        if not name:
            return Response(
                {"error": "Le nom de la collection est requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        collection = Collection.objects.create(
            user=request.user,
            name=name,
            description=description
        )
        
        return Response({
            "message": "Collection créée avec succès.",
            "collection": CollectionSerializer(collection).data
        }, status=status.HTTP_201_CREATED)


class AddToCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        model_type = request.data.get('content_type')
        object_id = request.data.get('object_id')

        if not all([model_type, object_id]):
            return Response(
                {"error": "Les champs content_type et object_id sont requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            collection = Collection.objects.get(id=id, user=request.user)
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection introuvable ou non autorisée."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            content_type_obj = ContentType.objects.get(model=model_type.lower())
        except ContentType.DoesNotExist:
            return Response({"error": "Type de contenu invalide."}, status=status.HTTP_400_BAD_REQUEST)

        item, created = CollectionItem.objects.get_or_create(
            collection=collection,
            content_type=content_type_obj,
            object_id=object_id
        )

        if created:
            return Response({"message": "Contenu ajouté à la collection."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Ce contenu est déjà dans la collection."}, status=status.HTTP_200_OK)


class DeleteCollectionView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id):
        try:
            collection = Collection.objects.get(id=id, user=request.user)
            collection.delete()
            return Response({"message": "Collection supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)
            
        except Collection.DoesNotExist:
            return Response(
                {"error": "Collection introuvable ou non autorisée."}, 
                status=status.HTTP_404_NOT_FOUND
            )


# manager VIEWS

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            user = authenticate(username=username, password=password)

            if user is not None:
                if not (user.is_staff or user.is_superuser):
                    return Response(
                        {'error': "Accès refusé. Vous n'avez pas les droits d'administration."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )

                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'is_staff': user.is_staff,
                        'is_superuser': user.is_superuser
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Identifiants incorrects.'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminGenreCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = GenreSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Genre créé avec succès.",
                "genre": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class AdminGenreDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, id):
        try:
            return Genre.objects.get(id=id)
        except Genre.DoesNotExist:
            return None

    def put(self, request, id):
        genre = self.get_object(id)
        if not genre:
            return Response({"error": "Genre introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = GenreSerializer(genre, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Genre modifié avec succès.",
                "genre": serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        genre = self.get_object(id)
        if not genre:
            return Response({"error": "Genre introuvable."}, status=status.HTTP_404_NOT_FOUND)

        genre.delete()
        return Response(
            {"message": "Genre supprimé avec succès."}, 
            status=status.HTTP_204_NO_CONTENT
        )



class AdminMovieCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminMovieSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            
            genres_data = validated_data.pop('genres', [])
            
            title = validated_data.get('title')
            slug = slugify(title)
            if Movie.objects.filter(slug=slug).exists():
                return Response(
                    {"error": "Un film avec ce titre ou slug existe déjà."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            movie = Movie.objects.create(slug=slug, **validated_data)
            if genres_data:
                movie.genres.set(genres_data)
                
            return Response({
                "message": "Film ajouté avec succès.",
                "movie_id": movie.id,
                "slug": movie.slug
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminMovieDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, id):
        try:
            return Movie.objects.get(id=id)
        except Movie.DoesNotExist:
            return None

    def put(self, request, id):
        movie = self.get_object(id)
        if not movie:
            return Response({"error": "Film introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AdminMovieSerializer(movie, data=request.data, partial=True)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            genres_data = validated_data.pop('genres', None)
            
            if 'title' in validated_data:
                validated_data['slug'] = slugify(validated_data['title'])
            for attr, value in validated_data.items():
                setattr(movie, attr, value)
            movie.save()
            
            # Mettre a jour les genres si le champ est fourni
            if genres_data is not None:
                movie.genres.set(genres_data)
                
            return Response({
                "message": "Film modifié avec succès.",
                "movie_id": movie.id
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        movie = self.get_object(id)
        if not movie:
            return Response({"error": "Film introuvable."}, status=status.HTTP_404_NOT_FOUND)
        movie.delete()
        return Response(
            {"message": "Film supprimé avec succès."}, 
            status=status.HTTP_204_NO_CONTENT
        )

class AdminSeriesCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminSeriesSerializer(data=request.data)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            
            genres_data = validated_data.pop('genres', [])
            
            title = validated_data.get('title')
            slug = slugify(title)
            
            if Series.objects.filter(slug=slug).exists():
                return Response(
                    {"error": "Une série avec ce titre ou slug existe déjà."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            series = Series.objects.create(slug=slug, **validated_data)
            
            if genres_data:
                series.genres.set(genres_data)
                
            return Response({
                "message": "Série ajoutée avec succès.",
                "series_id": series.id,
                "slug": series.slug
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminSeriesDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, id):
        try:
            return Series.objects.get(id=id)
        except Series.DoesNotExist:
            return None

    def put(self, request, id):
        series = self.get_object(id)
        if not series:
            return Response({"error": "Série introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminSeriesSerializer(series, data=request.data, partial=True)
        
        if serializer.is_valid():
            validated_data = serializer.validated_data
            genres_data = validated_data.pop('genres', None)
            
            # Si le titre change, maj du slug
            if 'title' in validated_data:
                validated_data['slug'] = slugify(validated_data['title'])
            
            for attr, value in validated_data.items():
                setattr(series, attr, value)
            series.save()
            
            if genres_data is not None:
                series.genres.set(genres_data)
                
            return Response({
                "message": "Série modifiée avec succès.",
                "series_id": series.id
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        series = self.get_object(id)
        if not series:
            return Response({"error": "Série introuvable."}, status=status.HTTP_404_NOT_FOUND)
            
        series.delete()
        return Response(
            {"message": "Série supprimée avec succès."}, 
            status=status.HTTP_204_NO_CONTENT
        )

class AdminSeasonCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminSeasonSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Saison ajoutée avec succès.",
                "season": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminEpisodeCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        serializer = AdminEpisodeSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Épisode ajouté avec succès.",
                "episode": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminEpisodeDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, id):
        try:
            return Episode.objects.get(id=id)
        except Episode.DoesNotExist:
            return None

    def put(self, request, id):
        episode = self.get_object(id)
        if not episode:
            return Response({"error": "Épisode introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminEpisodeSerializer(episode, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Épisode modifié avec succès.",
                "episode": serializer.data
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        episode = self.get_object(id)
        if not episode:
            return Response({"error": "Épisode introuvable."}, status=status.HTTP_404_NOT_FOUND)
            
        episode.delete()
        return Response(
            {"message": "Épisode supprimé avec succès."}, 
            status=status.HTTP_204_NO_CONTENT
        )

class AdminCommentDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, id):
        try:
            comment = Comment.objects.get(id=id)
            comment.delete()
            return Response(
                {"message": "Commentaire supprimé par l'administrateur."}, 
                status=status.HTTP_200_OK
            )
        except Comment.DoesNotExist:
            return Response(
                {"error": "Commentaire introuvable."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        # 1. Compter les totaux par modele
        total_users = User.objects.count()
        total_movies = Movie.objects.count()
        total_series = Series.objects.count()
        total_comments = Comment.objects.count()

        movie_views = Movie.objects.aggregate(total=Sum('views'))['total'] or 0
        episode_views = Episode.objects.aggregate(total=Sum('views'))['total'] or 0
        total_views = movie_views + episode_views

        stats_data = {
            "overview": {
                "total_users": total_users,
                "total_views": total_views,
                "total_comments": total_comments,
            },
            "content_breakdown": {
                "movies_count": total_movies,
                "series_count": total_series,
            }
        }

        return Response(stats_data, status=status.HTTP_200_OK)