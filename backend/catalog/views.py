from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.db.models import Avg, Count
from django.contrib.auth.models import User
from .models import Category, Item, Rental, Message, Notification, Review, Favorite
from .auth_serializers import UserSerializer
from .serializers import CategorySerializer, ItemSerializer, RentalSerializer, MessageSerializer, NotificationSerializer, ReviewSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    """API для категорий"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Фильтруем категории"""
        queryset = Category.objects.all()
        parent_only = self.request.query_params.get('parent_only', None)
        parent_id = self.request.query_params.get('parent_id', None)
        
        if parent_only == 'true':
            # Возвращаем только родительские категории
            queryset = queryset.filter(parent__isnull=True)
        elif parent_id:
            # Возвращаем подкатегории конкретной категории
            queryset = queryset.filter(parent_id=parent_id)
        
        return queryset.order_by('name')

class ItemViewSet(viewsets.ModelViewSet):
    """API для товаров"""
    queryset = Item.objects.all().select_related('owner', 'category').prefetch_related('media_files').order_by('-created_at')
    serializer_class = ItemSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Item.objects.all().select_related('owner', 'category').prefetch_related('media_files').order_by('-created_at')
        # Временно убираем subcategory из select_related, пока миграция не применена
        # После применения миграции можно вернуть: .select_related('owner', 'category', 'subcategory')
        # Фильтрация по статусу
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        # Фильтрация по категории
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        # Фильтрация по подкатегории
        subcategory = self.request.query_params.get('subcategory', None)
        if subcategory:
            queryset = queryset.filter(subcategory_id=subcategory)
        return queryset

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Получить занятые периоды аренды для товара"""
        item = self.get_object()
        rentals = Rental.objects.filter(
            item=item,
            status__in=['pending', 'confirmed', 'active']
        ).order_by('start_date')
        serializer = RentalSerializer(rentals, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def recommendations(self, request, pk=None):
        """Рекомендации: похожие товары и товары, которые арендуют те же пользователи"""
        item = self.get_object()

        # Похожие товары по категории
        similar_items = Item.objects.filter(
            category=item.category,
            status='available'
        ).exclude(id=item.id).select_related('owner', 'category').prefetch_related('media_files').order_by('-created_at')[:8]

        # Товары, которые арендовали пользователи, арендовавшие этот товар
        renter_ids = Rental.objects.filter(item=item).values_list('renter_id', flat=True)
        also_rented_items = Item.objects.none()
        if renter_ids:
            also_rented_items = (
                Item.objects.filter(
                    rental__renter_id__in=renter_ids,
                    status='available'
                )
                .exclude(id=item.id)
                .select_related('owner', 'category')
                .prefetch_related('media_files')
                .annotate(rentals_with_same_renters=Count('rental', distinct=True))
                .order_by('-rentals_with_same_renters', '-created_at')[:8]
            )

        context = self.get_serializer_context()
        similar_data = ItemSerializer(similar_items, many=True, context=context).data
        also_rented_data = ItemSerializer(also_rented_items, many=True, context=context).data

        return Response({
            'similar': similar_data,
            'also_rented': also_rented_data,
        })
    
    def get_serializer_context(self):
        """Передаем request в контекст сериализатора для построения полных URL"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Автоматически назначаем текущего пользователя как владельца товара"""
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Необходимо войти в систему для создания товара")
        serializer.save(owner=self.request.user)

class RentalViewSet(viewsets.ModelViewSet):
    """API для аренд"""
    queryset = Rental.objects.all()
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]  # Только для авторизованных
    
    def get_queryset(self):
        """Возвращаем аренды пользователя с опциональной фильтрацией по контексту"""
        user = self.request.user
        if not user.is_authenticated:
            return Rental.objects.none()

        as_owner = self.request.query_params.get('as_owner')
        if as_owner == 'true':
            return Rental.objects.filter(item__owner=user).select_related('item', 'renter')

        as_renter = self.request.query_params.get('as_renter')
        if as_renter == 'true':
            return Rental.objects.filter(renter=user).select_related('item', 'renter')

        return Rental.objects.filter(
            models.Q(item__owner=user) | models.Q(renter=user)
        ).select_related('item', 'renter').distinct()
    
    def perform_create(self, serializer):
        # Автоматически назначаем текущего пользователя как арендатора
        rental = serializer.save(renter=self.request.user)
        # Создаем уведомление для владельца товара
        Notification.objects.create(
            user=rental.item.owner,
            notification_type='rental_request',
            title='Новый запрос на аренду',
            message=f'Пользователь {rental.renter.username} хочет арендовать ваш товар "{rental.item.title}"',
            related_item=rental.item,
            related_rental=rental
        )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Подтвердить аренду (только владелец товара)"""
        rental = self.get_object()
        
        if rental.item.owner != request.user:
            return Response(
                {'error': 'Только владелец товара может подтвердить аренду'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status != 'pending':
            return Response(
                {'error': f'Нельзя подтвердить аренду со статусом {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'confirmed'
        rental.item.status = 'rented'
        rental.save()
        rental.item.save()
        
        # Создаем уведомление для арендатора
        Notification.objects.create(
            user=rental.renter,
            notification_type='rental_confirmed',
            title='Аренда подтверждена',
            message=f'Владелец подтвердил вашу заявку на аренду "{rental.item.title}"',
            related_item=rental.item,
            related_rental=rental
        )
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Отклонить аренду (только владелец товара)"""
        rental = self.get_object()
        
        if rental.item.owner != request.user:
            return Response(
                {'error': 'Только владелец товара может отклонить аренду'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status not in ['pending', 'confirmed']:
            return Response(
                {'error': f'Нельзя отклонить аренду со статусом {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'cancelled'
        rental.save()
        
        # Создаем уведомление для арендатора
        Notification.objects.create(
            user=rental.renter,
            notification_type='rental_cancelled',
            title='Аренда отклонена',
            message=f'Владелец отклонил вашу заявку на аренду "{rental.item.title}"',
            related_item=rental.item,
            related_rental=rental
        )
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Завершить аренду (владелец или арендатор)"""
        rental = self.get_object()
        
        if rental.item.owner != request.user and rental.renter != request.user:
            return Response(
                {'error': 'Только владелец или арендатор могут завершить аренду'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status not in ['confirmed', 'active']:
            return Response(
                {'error': f'Нельзя завершить аренду со статусом {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'completed'
        rental.item.status = 'available'
        rental.save()
        rental.item.save()
        
        # Создаем уведомление
        other_user = rental.item.owner if request.user == rental.renter else rental.renter
        Notification.objects.create(
            user=other_user,
            notification_type='rental_completed',
            title='Аренда завершена',
            message=f'Аренда "{rental.item.title}" завершена',
            related_item=rental.item,
            related_rental=rental
        )
        
        serializer = self.get_serializer(rental)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    """API для сообщений"""
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращаем только сообщения текущего пользователя"""
        user = self.request.user
        return Message.objects.filter(
            models.Q(sender=user) | models.Q(recipient=user)
        ).select_related('sender', 'recipient').order_by('-created_at')
    
    def get_serializer_context(self):
        """Передаем request в контекст сериализатора"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        """Автоматически назначаем отправителя и создаем уведомление"""
        message = serializer.save(sender=self.request.user)
        # Создаем уведомление для получателя
        Notification.objects.create(
            user=message.recipient,
            notification_type='message',
            title='Новое сообщение',
            message=f'Вам пришло сообщение от {message.sender.username}',
            related_item=None,
            related_rental=None
        )
    
    @action(detail=False, methods=['get'])
    def conversations(self, request):
        """Получить список всех диалогов пользователя"""
        user = request.user
        # Получаем уникальных собеседников
        sent_to = Message.objects.filter(sender=user).values_list('recipient', flat=True).distinct()
        received_from = Message.objects.filter(recipient=user).values_list('sender', flat=True).distinct()
        all_users = set(list(sent_to) + list(received_from))
        
        conversations = []
        for user_id in all_users:
            other_user = User.objects.get(id=user_id)
            last_message = Message.objects.filter(
                models.Q(sender=user, recipient=other_user) | 
                models.Q(sender=other_user, recipient=user)
            ).order_by('-created_at').first()
            
            unread_count = Message.objects.filter(
                sender=other_user, recipient=user, is_read=False
            ).count()
            
            conversations.append({
                'user_id': other_user.id,
                'username': other_user.username,
                'last_message': MessageSerializer(last_message, context={'request': request}).data if last_message else None,
                'unread_count': unread_count
            })
        
        return Response(conversations)
    
    @action(detail=False, methods=['get'])
    def with_user(self, request):
        """Получить все сообщения с конкретным пользователем"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            other_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        messages = Message.objects.filter(
            models.Q(sender=request.user, recipient=other_user) | 
            models.Q(sender=other_user, recipient=request.user)
        ).order_by('created_at')
        
        # Помечаем сообщения как прочитанные
        Message.objects.filter(sender=other_user, recipient=request.user, is_read=False).update(is_read=True)
        
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

class NotificationViewSet(viewsets.ModelViewSet):
    """API для уведомлений"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращаем только уведомления текущего пользователя"""
        return Notification.objects.filter(user=self.request.user).select_related(
            'related_item', 'related_rental'
        ).order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Получить количество непрочитанных уведомлений"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Пометить уведомление как прочитанное"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Пометить все уведомления как прочитанные"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

class ReviewViewSet(viewsets.ModelViewSet):
    """API для отзывов"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращаем отзывы в зависимости от параметров"""
        queryset = Review.objects.all().select_related('reviewer', 'reviewed_user', 'item', 'rental')
        
        # Фильтрация по пользователю
        user_id = self.request.query_params.get('user_id', None)
        if user_id:
            queryset = queryset.filter(reviewed_user_id=user_id)
        
        # Фильтрация по товару
        item_id = self.request.query_params.get('item_id', None)
        if item_id:
            queryset = queryset.filter(item_id=item_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Автоматически назначаем автора отзыва"""
        review = serializer.save(reviewer=self.request.user)
        
        # Обновляем рейтинг пользователя
        reviews = Review.objects.filter(reviewed_user=review.reviewed_user)
        if reviews.exists():
            avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
            if hasattr(review.reviewed_user, 'profile'):
                review.reviewed_user.profile.rating = round(avg_rating, 2)
                review.reviewed_user.profile.save()
        
        # Создаем уведомление
        Notification.objects.create(
            user=review.reviewed_user,
            notification_type='message',
            title='Новый отзыв',
            message=f'Пользователь {review.reviewer.username} оставил вам отзыв с оценкой {review.rating}/5',
            related_item=review.item,
            related_rental=review.rental
        )

class FavoriteViewSet(viewsets.ModelViewSet):
    """API для избранных товаров"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Возвращаем избранное текущего пользователя"""
        return Favorite.objects.filter(user=self.request.user).select_related('item', 'item__owner', 'item__category')
    
    def get_serializer_class(self):
        """Используем ItemSerializer для отображения товаров"""
        from .serializers import ItemSerializer
        return ItemSerializer
    
    def list(self, request, *args, **kwargs):
        """Возвращаем список избранных товаров"""
        favorites = self.get_queryset()
        items = [favorite.item for favorite in favorites]
        serializer = self.get_serializer(items, many=True, context={'request': request})
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Добавить товар в избранное"""
        item_id = request.data.get('item')
        if not item_id:
            return Response(
                {'error': 'Не указан товар'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response(
                {'error': 'Товар не найден'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Проверяем, не добавлен ли уже товар в избранное
        if Favorite.objects.filter(user=request.user, item=item).exists():
            return Response(
                {'error': 'Товар уже в избранном'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Создаем запись в избранном
        Favorite.objects.create(user=request.user, item=item)
        
        # Возвращаем данные товара
        from .serializers import ItemSerializer
        serializer = ItemSerializer(item, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        """Удалить товар из избранного"""
        item_id = kwargs.get('pk')
        try:
            favorite = Favorite.objects.get(user=request.user, item_id=item_id)
            favorite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Favorite.DoesNotExist:
            return Response(
                {'error': 'Товар не найден в избранном'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def check(self, request):
        """Проверить, есть ли товар в избранном"""
        item_id = request.query_params.get('item_id')
        if not item_id:
            return Response(
                {'error': 'Не указан item_id'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        is_favorite = Favorite.objects.filter(
            user=request.user,
            item_id=item_id
        ).exists()
        
        return Response({'is_favorite': is_favorite})