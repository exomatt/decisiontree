# Generated by Django 2.2.5 on 2019-09-23 15:57

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('decisionTreeCore', '0007_auto_20190923_1549'),
    ]

    operations = [
        migrations.AlterField(
            model_name='experiment',
            name='names_file_name',
            field=models.CharField(default='', max_length=50),
        ),
        migrations.AlterField(
            model_name='experiment',
            name='test_file_name',
            field=models.CharField(default='', max_length=50),
        ),
    ]
