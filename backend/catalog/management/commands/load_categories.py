from django.core.management.base import BaseCommand
from catalog.category_seed import seed_categories


class Command(BaseCommand):
    help = 'Загружает категории и подкатегории в базу данных'

    def handle(self, *args, **options):
        seed_categories()
        self.stdout.write(self.style.SUCCESS('\nВсе категории успешно загружены!'))
