from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .auth_serializers import UserSerializer, UserRegistrationSerializer, UserLoginSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            # Возвращаем полные данные пользователя с профилем
            user_serializer = UserSerializer(user, context={'request': request})
            return Response({
                'success': True,
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        logout(request)
        return Response({
            'success': True,
            'message': 'Вы успешно вышли из системы'
        }, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Автоматически логиним пользователя после регистрации
            login(request, user)
            
            # Возвращаем полные данные пользователя с профилем
            user_serializer = UserSerializer(user, context={'request': request})
            return Response({
                'success': True,
                'user': user_serializer.data,
                'message': 'Регистрация прошла успешно'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [AllowAny]  # Разрешаем доступ всем для проверки авторизации
    
    def get(self, request):
        if request.user.is_authenticated:
            user_serializer = UserSerializer(request.user, context={'request': request})
            return Response({
                'success': True,
                'user': user_serializer.data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'user': None
            }, status=status.HTTP_200_OK)
    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({
                'success': False,
                'error': 'Необходимо войти в систему'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = request.user
        # Обновляем данные пользователя
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            user.email = request.data['email']
        user.save()
        
        # Обновляем профиль
        if hasattr(user, 'profile'):
            profile = user.profile
            if 'phone' in request.data:
                profile.phone = request.data['phone']
            if 'region' in request.data:
                profile.region = request.data['region']
            if 'avatar' in request.FILES:
                profile.avatar = request.FILES['avatar']
            profile.save()
        
        user_serializer = UserSerializer(user, context={'request': request})
        return Response({
            'success': True,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)

class UserRentalsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import Rental
        from .serializers import RentalSerializer
        
        rentals = Rental.objects.filter(renter=request.user).order_by('-created_at')
        serializer = RentalSerializer(rentals, many=True)
        return Response({
            'success': True,
            'rentals': serializer.data
        }, status=status.HTTP_200_OK)

class UserItemsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import Item
        from .serializers import ItemSerializer
        
        items = Item.objects.filter(owner=request.user).order_by('-created_at')
        serializer = ItemSerializer(items, many=True, context={'request': request})
        return Response({
            'success': True,
            'items': serializer.data
        }, status=status.HTTP_200_OK)

class OwnerStatisticsView(APIView):
    """Статистика пользователя по его товарам и арендам"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from .models import Item, Rental
        from django.db.models import Sum, Count, Avg
        
        # Статистика по товарам
        items = Item.objects.filter(owner=request.user)
        total_items = items.count()
        available_items = items.filter(status='available').count()
        rented_items = items.filter(status='rented').count()
        
        # Статистика по арендам
        rentals = Rental.objects.filter(item__owner=request.user)
        total_rentals = rentals.count()
        pending_rentals = rentals.filter(status='pending').count()
        confirmed_rentals = rentals.filter(status='confirmed').count()
        active_rentals = rentals.filter(status='active').count()
        completed_rentals = rentals.filter(status='completed').count()
        
        # Доходы
        total_revenue = rentals.filter(status__in=['confirmed', 'active', 'completed']).aggregate(
            total=Sum('total_price')
        )['total'] or 0
        
        # Средний рейтинг
        avg_rating = request.user.profile.rating
        
        return Response({
            'success': True,
            'statistics': {
                'items': {
                    'total': total_items,
                    'available': available_items,
                    'rented': rented_items
                },
                'rentals': {
                    'total': total_rentals,
                    'pending': pending_rentals,
                    'confirmed': confirmed_rentals,
                    'active': active_rentals,
                    'completed': completed_rentals
                },
                'revenue': {
                    'total': float(total_revenue)
                },
                'rating': float(avg_rating)
            }
        }, status=status.HTTP_200_OK)