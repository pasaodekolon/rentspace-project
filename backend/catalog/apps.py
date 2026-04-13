from django.apps import AppConfig
from django.db.models.signals import post_migrate
import os


class CatalogConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'catalog'

    def ready(self):
        def auto_seed_categories(sender=None, **kwargs):
            if sender.label != 'catalog':
                return

            try:
                from catalog.category_seed import seed_categories
                seed_categories()
            except Exception as exc:
                print(f"[catalog] auto_seed_categories skipped: {exc}")

        def ensure_admin_user(sender=None, **kwargs):
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
                needs_update = created
                if not user.is_staff:
                    user.is_staff = True
                    needs_update = True
                if not user.is_superuser:
                    user.is_superuser = True
                    needs_update = True
                if email and user.email != email:
                    user.email = email
                    needs_update = True

                # Keep credentials predictable on hosted environments.
                user.set_password(password)
                needs_update = True

                if needs_update:
                    user.save()
            except Exception as exc:
                print(f"[catalog] ensure_admin_user skipped: {exc}")

        post_migrate.connect(auto_seed_categories, sender=self, dispatch_uid='catalog_auto_seed_categories')
        post_migrate.connect(ensure_admin_user, sender=self, dispatch_uid='catalog_auto_create_superuser')

        # Also try on app startup to handle hosted environments
        # where migration hooks may not run as expected.
        auto_seed_categories(sender=self)
        ensure_admin_user(sender=self)
