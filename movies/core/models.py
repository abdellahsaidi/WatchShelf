from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.text import slugify

# ==========================================
# 1. UTILISATEURS & GENRES
# ==========================================

class User(AbstractUser):
    """
    On étend AbstractUser pour ajouter avatar et bio.
    IMPORTANT : N'oublie pas d'ajouter AUTH_USER_MODEL = 'core.User' dans settings.py !
    """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.username


class Genre(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ==========================================
# 2. CONTENU PRINCIPAL
# ==========================================

class Movie(models.Model):
    VIDEO_TYPE_CHOICES = [
        ('UPLOAD', 'File Upload'),
        ('URL', 'External URL'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    views = models.PositiveIntegerField(default=0)
    
    # Media
    poster = models.ImageField(upload_to='posters/movies/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='covers/movies/', null=True, blank=True)
    trailer_url = models.URLField(null=True, blank=True)
    
    # Video source
    video_type = models.CharField(max_length=10, choices=VIDEO_TYPE_CHOICES, default='URL')
    video_file = models.FileField(upload_to='videos/movies/', null=True, blank=True)
    external_video_url = models.URLField(null=True, blank=True)
    
    # Relations
    genres = models.ManyToManyField(Genre, related_name='movies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Series(models.Model):
    SERIES_TYPE_CHOICES = [
        ('TV_SHOW', 'TV Show'),
        ('ANIME', 'Anime'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    type = models.CharField(max_length=20, choices=SERIES_TYPE_CHOICES, default='TV_SHOW')
    description = models.TextField(null=True, blank=True)
    release_date = models.DateField(null=True, blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    views = models.PositiveIntegerField(default=0)
    
    # Media
    poster = models.ImageField(upload_to='posters/series/', null=True, blank=True)
    cover_image = models.ImageField(upload_to='covers/series/', null=True, blank=True)
    trailer_url = models.URLField(null=True, blank=True)
    
    # Relations
    genres = models.ManyToManyField(Genre, related_name='series')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Series"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"


class Season(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name='seasons')
    season_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('series', 'season_number')
        ordering = ['season_number']

    def __str__(self):
        return f"{self.series.title} - Season {self.season_number}"


class Episode(models.Model):
    VIDEO_TYPE_CHOICES = [
        ('UPLOAD', 'File Upload'),
        ('URL', 'External URL'),
    ]

    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name='episodes')
    episode_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=0)
    views = models.PositiveIntegerField(default=0)
    
    # Video source
    video_type = models.CharField(max_length=10, choices=VIDEO_TYPE_CHOICES, default='URL')
    video_file = models.FileField(upload_to='videos/episodes/', null=True, blank=True)
    external_video_url = models.URLField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('season', 'episode_number')
        ordering = ['episode_number']

    def __str__(self):
        return f"{self.season} - Episode {self.episode_number}: {self.title}"


# ==========================================
# 3. SYSTÈME D'INTERACTIONS (Generic Foreign Keys)
# ==========================================

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    
    # Generic Foreign Key (lie au Movie, Series ou Episode)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Comment by {self.user.username} on {self.content_object}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Empêche le même user de liker le même contenu 2 fois
        unique_together = ('user', 'content_type', 'object_id')


class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    score = models.PositiveSmallIntegerField(help_text="Rating between 1 and 10")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')


class WatchHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_history')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    
    progress = models.PositiveIntegerField(help_text="Progress in seconds", default=0)
    watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'content_type', 'object_id')


# ==========================================
# 4. COLLECTIONS (Playlists)
# ==========================================

class Collection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='collections')
    name = models.CharField(max_length=150)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"


class CollectionItem(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE, related_name='items')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    class Meta:
        unique_together = ('collection', 'content_type', 'object_id')