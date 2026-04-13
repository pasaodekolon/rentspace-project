from django.core.management.base import BaseCommand
from catalog.models import Category


class Command(BaseCommand):
    help = 'Загружает категории и подкатегории в базу данных'

    def handle(self, *args, **options):
        categories_data = {
            'Костюмы и реквизит': {
                'icon': '🎭',
                'subcategories': {
                    'Костюмы': ['Костюмы супергероев', 'Исторические костюмы', 'Карнавальные костюмы', 'Театральные костюмы'],
                    'Реквизит': ['Оружие (бутафорское)', 'Аксессуары', 'Маски', 'Парики']
                }
            },
            'Электроника и техника': {
                'icon': '💻',
                'subcategories': {
                    'Фото и видео': ['Фотоаппараты', 'Видеокамеры', 'Дроны', 'Стабилизаторы', 'Объективы'],
                    'Аудио': ['Микрофоны', 'Колонки', 'Наушники', 'Аудиомикшеры'],
                    'Компьютеры': ['Ноутбуки', 'Планшеты', 'Мониторы', 'Периферия']
                }
            },
            'Инструменты и оборудование': {
                'icon': '🔧',
                'subcategories': {
                    'Строительные инструменты': ['Дрели и шуруповерты', 'Перфораторы', 'Шлифмашины', 'Пилы'],
                    'Садовый инвентарь': ['Газонокосилки', 'Триммеры', 'Культиваторы', 'Садовые инструменты'],
                    'Профессиональное оборудование': ['Генераторы', 'Компрессоры', 'Сварочное оборудование']
                }
            },
            'Спорт и туризм': {
                'icon': '🏃',
                'subcategories': {
                    'Туристическое снаряжение': ['Палатки', 'Рюкзаки', 'Спальники', 'Кемпинговое оборудование'],
                    'Спортивный инвентарь': ['Велосипеды', 'Лыжи', 'Сноуборды', 'Скейтборды'],
                    'Водный спорт': ['Каяки', 'SUP-доски', 'Снаряжение для дайвинга']
                }
            },
            'Для праздников': {
                'icon': '🎉',
                'subcategories': {
                    'Оформление': ['Шары', 'Гирлянды', 'Баннеры', 'Декорации'],
                    'Оборудование': ['Проекторы', 'Звуковое оборудование', 'Световое оборудование', 'Сцены'],
                    'Развлечения': ['Батуты', 'Аттракционы', 'Игровые автоматы']
                }
            },
            'Хобби и творчество': {
                'icon': '🎨',
                'subcategories': {
                    'Творчество': ['Мольберты', 'Краски и кисти', 'Гончарные круги', 'Швейные машины'],
                    'Музыка': ['Музыкальные инструменты', 'Синтезаторы', 'Ударные установки'],
                    'Коллекционирование': ['3D принтеры', 'Лазерные граверы', 'Инструменты для моделирования']
                }
            },
            'Транспорт': {
                'icon': '🚗',
                'subcategories': {
                    'Автомобили': ['Легковые автомобили', 'Электромобили', 'Ретро автомобили'],
                    'Мототехника': ['Мотоциклы', 'Скутеры', 'Квадроциклы'],
                    'Спецтехника': ['Грузовики', 'Экскаваторы', 'Подъемная техника']
                }
            },
            'Для дома': {
                'icon': '🏠',
                'subcategories': {
                    'Бытовая техника': ['Пылесосы', 'Стиральные машины', 'Холодильники'],
                    'Мебель': ['Столы и стулья', 'Диваны', 'Шкафы'],
                    'Интерьер': ['Ковры', 'Картины', 'Декоративные элементы']
                }
            }
        }

        for category_name, category_data in categories_data.items():
            # Создаем или получаем родительскую категорию
            parent_category, created = Category.objects.get_or_create(
                name=category_name,
                defaults={'icon': category_data['icon'], 'description': f'Категория: {category_name}'}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Создана категория: {category_name}'))
            else:
                # Обновляем иконку, если она изменилась
                if parent_category.icon != category_data['icon']:
                    parent_category.icon = category_data['icon']
                    parent_category.save()

            # Создаем подкатегории
            for subcategory_name, items in category_data['subcategories'].items():
                subcategory, created = Category.objects.get_or_create(
                    name=subcategory_name,
                    parent=parent_category,
                    defaults={'description': f'Подкатегория: {subcategory_name}'}
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Создана подкатегория: {subcategory_name}'))

                # Создаем элементы подкатегорий
                for item_name in items:
                    item, created = Category.objects.get_or_create(
                        name=item_name,
                        parent=subcategory,
                        defaults={'description': f'Элемент: {item_name}'}
                    )
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'    Создан элемент: {item_name}'))

        self.stdout.write(self.style.SUCCESS('\nВсе категории успешно загружены!'))

