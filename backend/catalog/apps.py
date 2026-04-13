from django.apps import AppConfig
from django.db.models.signals import post_migrate


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

        post_migrate.connect(auto_seed_categories, sender=self, dispatch_uid='catalog_auto_seed_categories')
