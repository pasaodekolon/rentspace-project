from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0014_profile_region'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='role',
        ),
    ]
