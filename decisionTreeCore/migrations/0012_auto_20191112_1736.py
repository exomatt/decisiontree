# Generated by Django 2.2.6 on 2019-11-12 17:36

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('decisionTreeCore', '0011_experiment_shared_from'),
    ]

    operations = [
        migrations.AddField(
            model_name='permissions',
            name='copy',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='permissions',
            name='delete',
            field=models.BooleanField(default=True),
        ),
    ]
