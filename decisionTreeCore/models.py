from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db import models


# Create your models here.


class Experiment(models.Model):
    status_choice = (('Pending', 'Pending'), ('Error', 'Error'), ('Running', 'Running'), ('Finished', 'Finished'),
                     ('Created', 'Created'),)

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=250)
    status = models.CharField(max_length=15, choices=status_choice, default='Created')
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, default=1)
    config_file_name = models.CharField(max_length=50)
    data_file_name = models.CharField(max_length=50)
    result_file_name = models.CharField(max_length=50, blank=True)
