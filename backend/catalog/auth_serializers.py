from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='profile.phone', read_only=True)
    region = serializers.CharField(source='profile.region', read_only=True)
    rating = serializers.CharField(source='profile.rating', read_only=True)
    avatar = serializers.SerializerMethodField()

    def get_avatar(self, obj):
        profile = getattr(obj, 'profile', None)
        if not profile or not profile.avatar:
            return None
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(profile.avatar.url)
        return profile.avatar.url
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'region', 'rating', 'avatar']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='Пароль должен содержать минимум 8 символов'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text='Подтвердите пароль'
    )
    phone = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=20,
        help_text='Номер телефона (необязательно)'
    )
    region = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        max_length=120,
        help_text='Область пользователя'
    )
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'region']
        extra_kwargs = {
            'username': {'help_text': 'Имя пользователя (обязательно)'},
            'email': {'required': True, 'help_text': 'Email адрес (обязательно)'},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Пользователь с таким именем уже существует')
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Пользователь с таким email уже существует')
        return value
    
    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')
        
        if password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        
        return data
    
    def create(self, validated_data):
        # Извлекаем данные профиля
        phone = validated_data.pop('phone', '')
        region = validated_data.pop('region', '')
        validated_data.pop('password_confirm', None)  # Удаляем подтверждение пароля
        
        # Создаем пользователя
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Обновляем профиль
        profile = user.profile
        profile.phone = phone
        profile.region = region
        profile.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True,
        help_text='Имя пользователя или email'
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text='Пароль'
    )
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if not username:
            raise serializers.ValidationError({
                'username': 'Необходимо указать имя пользователя или email'
            })
        
        if not password:
            raise serializers.ValidationError({
                'password': 'Необходимо указать пароль'
            })
        
        # Пытаемся найти пользователя по username или email
        user = None
        if '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            user = authenticate(username=username, password=password)
        
        if user:
            if user.is_active:
                data['user'] = user
            else:
                raise serializers.ValidationError({
                    'non_field_errors': ['Аккаунт деактивирован. Обратитесь к администратору.']
                })
        else:
            raise serializers.ValidationError({
                'non_field_errors': ['Неверные учетные данные. Проверьте имя пользователя и пароль.']
            })
        
        return data