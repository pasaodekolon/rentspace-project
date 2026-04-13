from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Телефон')
    region = models.CharField(max_length=120, blank=True, default='', verbose_name='Область')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Аватар')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=5.0, verbose_name='Рейтинг')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.user.username

# Автоматически создаем профиль при создании пользователя
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название категории')
    description = models.TextField(blank=True, verbose_name='Описание')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, blank=True, null=True, related_name='subcategories', verbose_name='Родительская категория')
    icon = models.CharField(max_length=10, blank=True, verbose_name='Иконка')
    
    def __str__(self):
        return self.name
    
    @property
    def is_parent(self):
        """Проверка, является ли категория родительской"""
        return self.parent is None
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

class Item(models.Model):
    STATUS_CHOICES = [
        ('available', 'Доступен'),
        ('rented', 'Арендован'),
        ('maintenance', 'На обслуживании'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Цена за день')
    deposit = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Залог', default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория', related_name='items')
    subcategory = models.ForeignKey(Category, on_delete=models.SET_NULL, blank=True, null=True, related_name='subcategory_items', verbose_name='Подкатегория')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Владелец')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', verbose_name='Статус')
    image = models.ImageField(upload_to='items/', blank=True, null=True, verbose_name='Изображение')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

class ItemMedia(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='media_files', verbose_name='Товар')
    file = models.ImageField(upload_to='items/media/', verbose_name='Медиафайл')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Медиа товара'
        verbose_name_plural = 'Медиа товаров'
        ordering = ['id']

    def __str__(self):
        return f"Media #{self.id} for {self.item.title}"

class Rental(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Ожидание подтверждения'),
        ('confirmed', 'Подтверждена'),
        ('active', 'Активна'),
        ('completed', 'Завершена'),
        ('cancelled', 'Отменена'),
    ]
    
    item = models.ForeignKey(Item, on_delete=models.CASCADE, verbose_name='Товар')
    renter = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Арендатор')
    start_date = models.DateField(verbose_name='Дата начала аренды')
    end_date = models.DateField(verbose_name='Дата окончания аренды')
    total_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Общая стоимость')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.item.title} - {self.renter.username}"
    
    class Meta:
        verbose_name = 'Аренда'
        verbose_name_plural = 'Аренды'

class Message(models.Model):
    """Модель для сообщений между пользователями"""
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages', verbose_name='Отправитель')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', verbose_name='Получатель')
    # В сообщении может быть только вложение (например, фото/файл), поэтому content допускаем пустым
    content = models.TextField(blank=True, default='', verbose_name='Содержание сообщения')
    image = models.ImageField(upload_to='messages/', blank=True, null=True, verbose_name='Изображение')
    # Универсальное вложение (кроме изображений)
    attachment = models.FileField(upload_to='messages/attachments/', blank=True, null=True, verbose_name='Файл')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
    
    def __str__(self):
        return f"{self.sender.username} -> {self.recipient.username}"

class Notification(models.Model):
    """Модель для уведомлений"""
    TYPE_CHOICES = [
        ('rental_request', 'Запрос на аренду'),
        ('rental_confirmed', 'Аренда подтверждена'),
        ('rental_cancelled', 'Аренда отменена'),
        ('message', 'Новое сообщение'),
        ('rental_completed', 'Аренда завершена'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', verbose_name='Пользователь')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='Тип уведомления')
    title = models.CharField(max_length=200, verbose_name='Заголовок')
    message = models.TextField(verbose_name='Сообщение')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    related_item = models.ForeignKey(Item, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Связанный товар')
    related_rental = models.ForeignKey(Rental, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Связанная аренда')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
    
    def __str__(self):
        return f"{self.user.username} - {self.get_notification_type_display()}"

class Review(models.Model):
    """Модель для отзывов о товарах и пользователях"""
    RATING_CHOICES = [
        (1, '1 - Ужасно'),
        (2, '2 - Плохо'),
        (3, '3 - Нормально'),
        (4, '4 - Хорошо'),
        (5, '5 - Отлично'),
    ]
    
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given', verbose_name='Автор отзыва')
    reviewed_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_received', verbose_name='Оцениваемый пользователь')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Товар')
    rental = models.ForeignKey(Rental, on_delete=models.CASCADE, blank=True, null=True, verbose_name='Аренда')
    rating = models.IntegerField(choices=RATING_CHOICES, verbose_name='Оценка')
    comment = models.TextField(verbose_name='Комментарий')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        unique_together = [['reviewer', 'rental']]  # Один отзыв на аренду
    
    def __str__(self):
        return f"{self.reviewer.username} -> {self.reviewed_user.username}: {self.rating}/5"

class Favorite(models.Model):
    """Модель для избранных товаров"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites', verbose_name='Пользователь')
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='favorited_by', verbose_name='Товар')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = [['user', 'item']]  # Один товар может быть в избранном только один раз
        ordering = ['-created_at']
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'
    
    def __str__(self):
        return f"{self.user.username} - {self.item.title}"