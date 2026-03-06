from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from .storage_backend import MainImageStorage, MoreImagesStorage, VideosStorage
from django.utils import timezone
import random
import uuid

class Site(models.Model):
    id = models.AutoField(primary_key=True)
    mainImage = models.ImageField(storage=MainImageStorage(), upload_to='main_images/', blank=False, null=False)
    community = models.CharField(max_length=255, blank=False, null=False)
    groupName = models.CharField(max_length=255, blank=False, null=False)
    quickInfo = models.TextField(blank=False, null=False)
    detail = models.TextField(blank=True, null=True)
    access = models.JSONField(default=list, blank=False, null=False)
    instruments = models.JSONField(default=list, blank=False, null=False)
    address = models.TextField(blank=False, null=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    verified = models.BooleanField(default=False)  
    def __str__(self):
        return f"Site ID: {self.id} - Title: {self.groupName}"

class Artist(models.Model):
    id = models.AutoField(primary_key=True)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name="artists")  
    name = models.CharField(max_length=255, blank=False, null=False)
    profilePicture = models.ImageField(storage=MainImageStorage(), upload_to='artist_profiles/', blank=False, null=False)
    instruments = models.JSONField(default=list, blank=False, null=False)
    detail = models.TextField(blank=True, null=True)
    def __str__(self):
        return self.name

class MoreImage(models.Model):
    image = models.ImageField(storage=MoreImagesStorage(), upload_to='more_images/')
    site = models.ForeignKey(Site, related_name='moreImages', on_delete=models.CASCADE, null=True, blank=True)
    artist = models.ForeignKey(Artist, related_name='artistMoreImages', on_delete=models.CASCADE, null=True, blank=True)
    def __str__(self):
        return self.image.url

class Video(models.Model):
    video = models.FileField(storage=VideosStorage(), upload_to='videos/')
    site = models.ForeignKey(Site, related_name='videos', on_delete=models.CASCADE, null=True, blank=True)
    artist = models.ForeignKey(Artist, related_name='artistVideos', on_delete=models.CASCADE, null=True, blank=True)  
    def __str__(self):
        return self.video.url


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    is_staff = models.BooleanField(default=False)  # Required for admin access
    is_superuser = models.BooleanField(default=False)  # Required for superuser status
    is_active = models.BooleanField(default=True)  # For account activation

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'country']

    def __str__(self):
        return self.email

    # Required for permissions in admin
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
class UserFeedback(models.Model):
    id = models.AutoField(primary_key=True)  
    rating = models.PositiveIntegerField()  
    comment = models.TextField(blank=True, null=True)  
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)  
    site = models.ForeignKey(Site, on_delete=models.CASCADE)  
    def __str__(self):
        return f"Feedback by {self.user} for {self.site}"
    
    

class OTP(models.Model):
    mobile_number = models.CharField(max_length=15, unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.otp:
            self.otp = str(random.randint(100000, 999999))  # 6-digit OTP
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=5)  # 5-minute expiry
        super().save(*args, **kwargs)

    def is_valid(self):
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"{self.mobile_number} - {self.otp}"
    
class AdminToken(models.Model):
    token = models.CharField(max_length=36, unique=True)  
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.token:
            # Generate UUID4 token if not set
            self.token = str(uuid.uuid4())
        if not self.expires_at:
            # Set default expiration to 5 minutes from now
            self.expires_at = timezone.now() + timezone.timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_valid(self):
        # Check if token is not expired
        return timezone.now() <= self.expires_at

    def __str__(self):
        return f"{self.token}"

    class Meta:
        verbose_name = "Admin Token"
        verbose_name_plural = "Admin Tokens"