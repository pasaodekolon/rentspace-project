from rest_framework import serializers
from .models import Category, Item, ItemMedia, Rental, Message, Notification, Review
from django.contrib.auth.models import User

class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    def get_subcategories(self, obj):
        """Возвращаем подкатегории, если это родительская категория"""
        if obj.is_parent:
            subcats = Category.objects.filter(parent=obj)
            # Используем упрощенный сериализатор для подкатегорий, чтобы избежать бесконечной рекурсии
            return [{
                'id': subcat.id,
                'name': subcat.name,
                'description': subcat.description,
                'icon': subcat.icon,
                'subcategories': [
                    {
                        'id': item.id,
                        'name': item.name,
                        'description': item.description,
                        'icon': item.icon
                    }
                    for item in Category.objects.filter(parent=subcat)
                ]
            } for subcat in subcats]
        return []
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'parent', 'icon', 'subcategories']

class ItemSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.SerializerMethodField()
    owner_rating = serializers.SerializerMethodField()
    owner_avatar = serializers.SerializerMethodField()
    owner_region = serializers.SerializerMethodField()
    media = serializers.SerializerMethodField()
    media_files = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    owner = serializers.PrimaryKeyRelatedField(read_only=True)  # Владелец назначается автоматически
    
    def get_subcategory_name(self, obj):
        """Безопасно получаем название подкатегории"""
        try:
            if hasattr(obj, 'subcategory') and obj.subcategory:
                return obj.subcategory.name
        except:
            pass
        return None
    
    def get_owner_rating(self, obj):
        """Получаем рейтинг владельца из профиля"""
        if hasattr(obj.owner, 'profile'):
            return float(obj.owner.profile.rating)
        return 5.0

    def get_owner_avatar(self, obj):
        if not hasattr(obj.owner, 'profile') or not obj.owner.profile.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.owner.profile.avatar.url)
        return obj.owner.profile.avatar.url

    def get_owner_region(self, obj):
        if hasattr(obj.owner, 'profile'):
            return obj.owner.profile.region
        return ''

    def get_media(self, obj):
        request = self.context.get('request')
        result = []
        for media in obj.media_files.all():
            if request:
                result.append(request.build_absolute_uri(media.file.url))
            else:
                result.append(media.file.url)
        return result

    def to_representation(self, instance):
        """Переопределяем представление для построения полного URL изображения"""
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                representation['image'] = instance.image.url
        else:
            representation['image'] = None
        return representation

    def create(self, validated_data):
        media_files = validated_data.pop('media_files', [])
        item = super().create(validated_data)
        if media_files:
            for media_file in media_files:
                ItemMedia.objects.create(item=item, file=media_file)
            if not item.image:
                item.image = media_files[0]
                item.save(update_fields=['image'])
        return item

    class Meta:
        model = Item
        fields = [
            'id', 
            'title', 
            'description', 
            'price_per_day', 
            'deposit', 
            'category', 
            'category_name',
            'subcategory',
            'subcategory_name',
            'owner', 
            'owner_username',
            'owner_rating',
            'owner_avatar',
            'owner_region',
            'status',
            'image',
            'media',
            'media_files',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at']

class RentalSerializer(serializers.ModelSerializer):
    item_title = serializers.CharField(source='item.title', read_only=True)
    renter_name = serializers.CharField(source='renter.username', read_only=True)
    renter = serializers.PrimaryKeyRelatedField(read_only=True)  # Арендатор назначается автоматически
    
    class Meta:
        model = Rental
        fields = [
            'id', 'item', 'item_title', 'renter', 'renter_name',
            'start_date', 'end_date', 'total_price', 'status', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    # Разрешаем отправлять сообщение только с вложением (без текста).
    content = serializers.CharField(required=False, allow_blank=True, default='')
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    sender = serializers.PrimaryKeyRelatedField(read_only=True)
    
    def to_representation(self, instance):
        """Переопределяем представление для построения полного URL изображения"""
        representation = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                representation['image'] = instance.image.url
        else:
            representation['image'] = None

        if instance.attachment:
            request = self.context.get('request')
            if request:
                representation['attachment'] = request.build_absolute_uri(instance.attachment.url)
            else:
                representation['attachment'] = instance.attachment.url
        else:
            representation['attachment'] = None

        return representation
    
    class Meta:
        model = Message
        fields = [
            'id', 'sender', 'sender_username', 'recipient', 'recipient_username',
            'content', 'image', 'attachment', 'is_read', 'created_at'
        ]
        read_only_fields = ['is_read', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    related_item_title = serializers.CharField(source='related_item.title', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'is_read', 'related_item', 'related_item_title', 'related_rental', 'created_at'
        ]
        read_only_fields = ['is_read', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)
    reviewed_user_username = serializers.CharField(source='reviewed_user.username', read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True, allow_null=True)
    reviewer = serializers.PrimaryKeyRelatedField(read_only=True)
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all(), required=False, allow_null=True)
    rental = serializers.PrimaryKeyRelatedField(queryset=Rental.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'reviewer_username', 'reviewed_user', 'reviewed_user_username',
            'item', 'item_title', 'rental', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['created_at']