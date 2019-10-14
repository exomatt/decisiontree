from django.contrib import admin

# Register your models here.
from decisionTreeCore.models import Experiment, Progress

admin.site.register(Experiment)
admin.site.register(Progress)
