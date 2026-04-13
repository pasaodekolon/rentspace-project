from django.utils.deprecation import MiddlewareMixin

class DisableCSRFForAPI(MiddlewareMixin):
    """
    Middleware для отключения CSRF проверки для API endpoints.
    Это безопасно, так как мы используем SessionAuthentication через DRF.
    """
    def process_request(self, request):
        # Отключаем CSRF для всех запросов к API
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None

