import json
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.core.mail import send_mail
from django.http import QueryDict
from django.http.multipartparser import MultiPartParser
from io import BytesIO
import copy

def send_message_to_mobile(number, message):
    send_mail(
        subject="Community application verification message",
        message=message,
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=["b22ee050@iitj.ac.in"],
        fail_silently=False,
    )

class CommunityApplicationNotificationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        path = request.path
        method = request.method.upper()

        # Only target approve/reject endpoints
        if (path.startswith('/verify_application/approve/') and method == "PUT") or \
           (path.startswith('/verify_application/reject/') and method == "DELETE"):

            access_numbers = self._extract_access(request)
            print(f"Access numbers extracted: {access_numbers}")

            message = (
                "Your community application has been approved."
                if "approve" in path else
                "Your community application has been rejected."
            )

            for number in access_numbers:
                send_message_to_mobile(number, message)

        return None  # Let request proceed

    def _extract_access(self, request):
        access_numbers = []

        # --- CASE 1: multipart/form-data (PUT with files) ---
        content_type = request.META.get('CONTENT_TYPE', '')
        if content_type.startswith('multipart/'):
            # Create a copy of request to avoid consuming body
            try:
                # Deep copy META, shallow copy body
                meta = request.META.copy()
                body_copy = request.body  # bytes
                input_stream = BytesIO(body_copy)

                parser = MultiPartParser(meta, input_stream, request.upload_handlers, request.encoding)
                data, files = parser.parse()

                # Extract access[0], access[1], etc.
                i = 0
                while True:
                    key = f'access[{i}]'
                    if key in data:
                        value = data.get(key)
                        if value:
                            access_numbers.append(value)
                        i += 1
                    else:
                        break
            except Exception as e:
                print(f"Multipart parsing failed: {e}")

        # --- CASE 2: JSON body (application/json) ---
        elif 'application/json' in content_type:
            try:
                if request.body:
                    data = json.loads(request.body.decode('utf-8'))
                    access = data.get('access', [])
                    if isinstance(access, list):
                        access_numbers.extend(access)
            except Exception as e:
                print(f"JSON parsing failed: {e}")

        return access_numbers
