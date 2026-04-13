from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import Profile, Category, Item, Rental

# Профиль отображаем inline с пользователем
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Профиль'

# Расширяем стандартного пользователя
class CustomUserAdmin(UserAdmin):
    inlines = (ProfileInline,)
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff']
    list_filter = ['is_staff', 'is_superuser']

# Перерегистрируем User
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'phone', 'region', 'created_at']
    list_filter = ['region', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'price_per_day', 'deposit', 'category', 'owner', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['title', 'description']

@admin.register(Rental)
class RentalAdmin(admin.ModelAdmin):
    list_display = ['item', 'renter', 'start_date', 'end_date', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'start_date']
    search_fields = ['item__title', 'renter__username']