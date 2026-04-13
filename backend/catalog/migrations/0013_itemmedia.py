from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0012_message_attachment_and_content_blank'),
    ]

    operations = [
        migrations.CreateModel(
            name='ItemMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.ImageField(upload_to='items/media/', verbose_name='Медиафайл')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media_files', to='catalog.item', verbose_name='Товар')),
            ],
            options={
                'verbose_name': 'Медиа товара',
                'verbose_name_plural': 'Медиа товаров',
                'ordering': ['id'],
            },
        ),
    ]
