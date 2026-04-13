from django.apps import AppConfig
from django.db.models.signals import post_migrate
import os


class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'catalog'

    def ready(self):
        def auto_seed_categories(sender, **kwargs):
            if sender.label != 'catalog':
                return

            try:
                from catalog.category_seed import seed_categories
                seed_categories()
            except Exception:
                # Keep migrations/deploy resilient if DB is not ready yet.
                pass

        def ensure_admin_user(sender, **kwargs):
            if sender.label != 'catalog':
                return

            username = os.getenv('DJANGO_SUPERUSER_USERNAME')
            email = os.getenv('DJANGO_SUPERUSER_EMAIL')
            password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
            if not username or not password:
                return

            try:
                from django.contrib.auth.models import User
                user, created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'email': email or '',
                        'is_staff': True,
                        'is_superuser': True,
                    },
                )
                if created:
                    user.set_password(password)
                    user.save()
            except Exception:
                # Keep migrations/deploy resilient if auth tables are not ready yet.
                pass

        post_migrate.connect(auto_seed_categories, sender=self, dispatch_uid='catalog_auto_seed_categories')
        post_migrate.connect(ensure_admin_user, sender=self, dispatch_uid='catalog_auto_create_superuser')
