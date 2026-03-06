from django.contrib import admin
import nested_admin
from .models import Site, Artist, UserFeedback, MoreImage, Video

class MoreImageInline(nested_admin.NestedTabularInline):
    model = MoreImage
    extra = 0
    classes = ['collapse']

class VideoInline(nested_admin.NestedTabularInline):
    model = Video
    extra = 0
    classes = ['collapse']

class ArtistInline(nested_admin.NestedTabularInline):
    model = Artist
    extra = 0
    classes = ['collapse']
    inlines = [MoreImageInline, VideoInline]

@admin.register(Site)
class SiteAdmin(nested_admin.NestedModelAdmin):
    inlines = [ArtistInline, MoreImageInline, VideoInline]

@admin.register(Artist)
class ArtistAdmin(nested_admin.NestedModelAdmin):
    inlines = [MoreImageInline, VideoInline]

admin.site.register([UserFeedback, MoreImage, Video])