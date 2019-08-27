from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import models


# Create your models here.


class Experiment(models.Model):
    status_choice = (('Error', 'Error'), ('Running', 'Running'), ('Finished', 'Finished'),
                     ('Created', 'Created'),)
    DATE_INPUT_FORMATS = '%Y-%m-%d %H:%M:%S'
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=250)
    error_message = models.CharField(max_length=250, blank=True)
    status = models.CharField(max_length=15, choices=status_choice, default='Created')
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(get_user_model(), related_name="experiment", on_delete=models.CASCADE, default=1)
    config_file_name = models.CharField(max_length=50)
    data_file_name = models.CharField(max_length=50)
    result_directory_path = models.CharField(max_length=50, blank=True)
    runs_number = models.SmallIntegerField(blank=True, default=1)

class Result(models.Model):
    experiment = models.OneToOneField(Experiment, on_delete=models.CASCADE)
    min_iteration = models.IntegerField(blank=True)
    runs = models.IntegerField(blank=True)
    mean_time = models.FloatField(blank=True)
    last_iter_number = models.IntegerField(blank=True)
