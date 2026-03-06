from storages.backends.s3boto3 import S3Boto3Storage
import environ

env = environ.Env()
environ.Env.read_env()  

class MainImageStorage(S3Boto3Storage):
    bucket_name = env('MAIN_IMAGE_BUCKET')
    custom_domain = f's3.ap-south-1.amazonaws.com/{bucket_name}'  

class MoreImagesStorage(S3Boto3Storage):
    bucket_name = env('MORE_IMAGES_BUCKET')
    custom_domain = f's3.ap-south-1.amazonaws.com/{bucket_name}'  

class VideosStorage(S3Boto3Storage):
    bucket_name = env('VIDEOS_BUCKET')
    custom_domain = f's3.ap-south-1.amazonaws.com/{bucket_name}'  




