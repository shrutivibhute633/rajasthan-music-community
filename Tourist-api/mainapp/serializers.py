from rest_framework import serializers
from .models import Site, Artist, UserFeedback, MoreImage, Video,CustomUser
from django.db import transaction
from django.contrib.auth import get_user_model,authenticate
from django.contrib.auth.password_validation import validate_password
from django.http import QueryDict
class MoreImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoreImage
        fields = ['id', 'image']  


class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'video']  


class MapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Site
        fields = ['id', 'mainImage', 'community', 'groupName','instruments', 'latitude', 'longitude','address']  


class ArtistSerializer(serializers.ModelSerializer):
    artistMoreImages = MoreImageSerializer(many=True, required=False)
    artistVideos = VideoSerializer(many=True, required=False)
    
    class Meta:
        model = Artist
        fields = '__all__'
        extra_kwargs = {
            'profilePicture': {'required': False},
            'instruments': {'required': False},
            'name': {'required': True},
        }

    def create(self, validated_data):
        # Extract nested data (e.g., images/videos)
        more_images_data = validated_data.pop('artistMoreImages', [])
        videos_data = validated_data.pop('artistVideos', [])
        # Create the Artist instance with ALL validated data (including instruments)
        artist = Artist.objects.create(**validated_data)

        # Handle nested media
        for image_data in more_images_data:
            MoreImage.objects.create(artist=artist, **image_data)
        for video_data in videos_data:
            Video.objects.create(artist=artist, **video_data)

        return artist

    def update(self, instance, validated_data):
        more_images_data = validated_data.pop('artistMoreImages', [])
        videos_data = validated_data.pop('artistVideos', [])

        instance.name = validated_data.get('name', instance.name)
        if 'profilePicture' in validated_data:
            instance.profilePicture = validated_data['profilePicture']
        instance.instruments = validated_data.get('instruments', instance.instruments)
        instance.detail = validated_data.get('detail', instance.detail)
        instance.save()

        if more_images_data != instance.artistMoreImages.all():  # Only update if different
            MoreImage.objects.filter(artist=instance).delete()
            for image_data in more_images_data:
                MoreImage.objects.create(artist=instance, **image_data)
        if videos_data != instance.artistVideos.all():  # Only update if different
            Video.objects.filter(artist=instance).delete()
            for video_data in videos_data:
                Video.objects.create(artist=instance, **video_data)

        return instance


class DetailSerializer(serializers.ModelSerializer):
    moreImages = MoreImageSerializer(many=True, required=False)
    videos = VideoSerializer(many=True, required=False)
    artists = ArtistSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Site
        fields = '__all__'
        extra_kwargs = {
            'mainImage': {'required': False},
            'instruments': {'required': False},
        }

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']

        main_image = request.FILES.get('mainImage')
        more_images = [file for key, file in request.FILES.items() if key.startswith('media.images')]
        videos = [file for key, file in request.FILES.items() if key.startswith('media.videos')]

        access_data = ','.join([value for key, value in request.data.items() if key.startswith('access')])
        instruments = ','.join([value for key, value in request.data.items() if key.startswith('instruments')])
        validated_data.pop('mainImage', None)
        site = Site.objects.create(
            **validated_data,
            mainImage=main_image,
            access=access_data,
            instruments=instruments
        )

        for image_file in more_images:
            MoreImage.objects.create(site=site, image=image_file)
        for video_file in videos:
            Video.objects.create(site=site, video=video_file)

        artists_data = {}
        for key, value in request.data.items():
            if key.startswith('artists['):
                parts = key.split('.')
                index = parts[0].replace('artists[', '').replace(']', '')
                field = parts[1] if len(parts) > 1 else None
                if field.startswith('instruments['):
                    artists_data.setdefault(index, {}).setdefault('instruments', []).append(value)
                else:
                    artists_data.setdefault(index, {})[field] = value
      
        for key, file in request.FILES.items():
            if key.startswith('artists['):
                try:
                    parts = key.split('.')
                    index = parts[0].replace('artists[', '').replace(']', '')
                    field = parts[1]
                    if field == 'profilePicture':
                        artists_data.setdefault(index, {})[field] = file
                    elif field == 'media' and len(parts) > 2:
                        subfield = parts[2]
                        if subfield.startswith('images'):
                            artists_data.setdefault(index, {}).setdefault('media.images', []).append(file)
                        elif subfield.startswith('videos'):
                            artists_data.setdefault(index, {}).setdefault('media.videos', []).append(file)
                except IndexError:
                    continue

        for index, artist_data in artists_data.items():
            artist_data['site'] = site.id
            profile_picture = artist_data.pop('profilePicture', None)
            if profile_picture:
                artist_data['profilePicture'] = profile_picture

            artist_media_images = artist_data.pop('media.images', [])
            artist_media_videos = artist_data.pop('media.videos', [])
            artist_data['artistMoreImages'] = [{'image': img} for img in artist_media_images]
            artist_data['artistVideos'] = [{'video': vid} for vid in artist_media_videos]
            print("Artist Data:", artist_data)  # Debugging line
            artist_serializer = ArtistSerializer(data=artist_data, context={'request': request})
            if artist_serializer.is_valid():
                artist_serializer.save()
            else:
                print("Artist Validation Errors:", artist_serializer.errors)
                raise serializers.ValidationError(artist_serializer.errors)
        
        return site

    @transaction.atomic
    def update(self, instance, validated_data):
        request = self.context['request']

        # Assuming request.data is a QueryDict
        if isinstance(request.data, QueryDict):
            data_dict = request.data.dict()
        else:
            data_dict = request.data


        # Update site-related fields
        main_image = request.FILES.get('mainImage', None)
        if main_image:
            instance.mainImage = main_image

        instance.community = validated_data.get('community', instance.community)
        instance.groupName = validated_data.get('groupName', instance.groupName)
        instance.quickInfo = validated_data.get('quickInfo', instance.quickInfo)
        instance.detail = validated_data.get('detail', instance.detail)
        instance.address = validated_data.get('address', instance.address)
        instance.latitude = validated_data.get('latitude', instance.latitude)
        instance.longitude = validated_data.get('longitude', instance.longitude)
        instance.verified = validated_data.get('verified', instance.verified)

        # Handle access and instruments (clear if not provided)
        access_data = ','.join([value for key, value in request.data.items() if key.startswith('access')])
        instruments = ','.join([value for key, value in request.data.items() if key.startswith('instruments')])
        instance.access = access_data if access_data else ''
        instance.instruments = instruments if instruments else ''

        instance.save()

        # Handle moreImages: Replace with new data or clear if none provided
        more_images = [file for key, file in request.FILES.items() if key.startswith('media.images')]
        if 'media.images[0]' in request.FILES or not any(key.startswith('media.images') for key in request.data):
            MoreImage.objects.filter(site=instance).delete()  # Clear if new images or no image data
            for image_file in more_images:
                MoreImage.objects.create(site=instance, image=image_file)

        # Handle videos: Replace with new data or clear if none provided
        videos = [file for key, file in request.FILES.items() if key.startswith('media.videos')]
        if 'media.videos[0]' in request.FILES or not any(key.startswith('media.videos') for key in request.data):
            Video.objects.filter(site=instance).delete()  # Clear if new videos or no video data
            for video_file in videos:
                Video.objects.create(site=instance, video=video_file)

        # Handle artists: Replace with new data or clear if none provided
        artists_data = {}
        for key, value in request.data.items():
            if key.startswith('artists['):
                try:
                    parts = key.split('.')
                    index = parts[0].replace('artists[', '').replace(']', '')
                    field = parts[1]
                    if field.startswith('instruments['):
                        artists_data.setdefault(index, {}).setdefault('instruments', []).append(value)
                    else:
                        artists_data.setdefault(index, {})[field] = value
                except IndexError:
                    continue

        for key, file in request.FILES.items():
            if key.startswith('artists['):
                try:
                    parts = key.split('.')
                    index = parts[0].replace('artists[', '').replace(']', '')
                    field = parts[1]
                    if field == 'profilePicture':
                        artists_data.setdefault(index, {})[field] = file
                    elif field == 'media' and len(parts) > 2:
                        subfield = parts[2]
                        if subfield.startswith('images'):
                            artists_data.setdefault(index, {}).setdefault('media.images', []).append(file)
                        elif subfield.startswith('videos'):
                            artists_data.setdefault(index, {}).setdefault('media.videos', []).append(file)
                except IndexError:
                    continue

        # Replace artists: Clear if no artist data is sent, otherwise update
        if any(key.startswith('artists[') for key in request.data) or any(key.startswith('artists[') for key in request.FILES):
            Artist.objects.filter(site=instance).delete()  # Clear existing artists
            for index, artist_data in artists_data.items():
                artist_data['site'] = instance.id
                profile_picture = artist_data.pop('profilePicture', None)
                if profile_picture:
                    artist_data['profilePicture'] = profile_picture

                artist_media_images = artist_data.pop('media.images', [])
                artist_media_videos = artist_data.pop('media.videos', [])
                artist_data['artistMoreImages'] = [{'image': img} for img in artist_media_images]
                artist_data['artistVideos'] = [{'video': vid} for vid in artist_media_videos]

                # Use instruments if artist.instrument is not provided
                if 'instruments' not in artist_data or not artist_data['instruments']:
                    artist_data['instruments'] = instruments.split(',')[0] if instruments else instance.instruments.split(',')[0] if instance.instruments else ''

                artist_serializer = ArtistSerializer(data=artist_data, context={'request': request})
                if artist_serializer.is_valid():
                    artist_serializer.save()
                else:
                    print("Artist Validation Errors in update:", artist_serializer.errors)
                    raise serializers.ValidationError(artist_serializer.errors)
        else:
            # If no artist data is sent, delete all artists
            Artist.objects.filter(site=instance).delete()

        return instance


class UserFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFeedback
        fields = '__all__'
        

CustomUser = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
        else:
            raise serializers.ValidationError('Email and password are required')

        data['user'] = user
        return data

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'country', 'password', 'is_staff', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True},
            'is_staff': {'read_only': True},
            'is_superuser': {'read_only': True},
        }

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            country=validated_data.get('country', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.country = validated_data.get('country', instance.country)
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        instance.save()
        return instance
