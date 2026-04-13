from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from catalog.views import CategoryViewSet, ItemViewSet, RentalViewSet, MessageViewSet, NotificationViewSet, ReviewViewSet, FavoriteViewSet
from catalog.auth_views import LoginView, LogoutView, RegisterView, UserProfileView, UserRentalsView, UserItemsView, OwnerStatisticsView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'items', ItemViewSet)
router.register(r'rentals', RentalViewSet)
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/user/', UserProfileView.as_view(), name='user-profile'),
    path('api/auth/my-rentals/', UserRentalsView.as_view(), name='user-rentals'),
    path('api/auth/my-items/', UserItemsView.as_view(), name='user-items'),
    path('api/auth/statistics/', OwnerStatisticsView.as_view(), name='owner-statistics'),
]

# ОБЯЗАТЕЛЬНО добавь эту строку для медиа файлов
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)