# Generated by Django 2.2.4 on 2019-09-05 17:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('decisionTreeCore', '0005_auto_20190905_1722'),
    ]

    operations = [
        migrations.AlterField(
            model_name='progress',
            name='run_number',
            field=models.IntegerField(blank=True, default=0),
        ),
    ]