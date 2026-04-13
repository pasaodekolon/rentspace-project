from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0013_itemmedia'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='region',
            field=models.CharField(blank=True, default='', max_length=120, verbose_name='Область'),
        ),
    ]
