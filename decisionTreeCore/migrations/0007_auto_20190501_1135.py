# Generated by Django 2.2 on 2019-05-01 11:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('decisionTreeCore', '0006_auto_20190501_1131'),
    ]

    operations = [
        migrations.AlterField(
            model_name='experiment',
            name='user',
            field=models.ForeignKey(blank=True, on_delete=django.db.models.deletion.CASCADE,
                                    to=settings.AUTH_USER_MODEL),
        ),
    ]