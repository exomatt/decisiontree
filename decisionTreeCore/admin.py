from django.contrib import admin

# Register your models here.
from decisionTreeCore.models import Experiment, Progress, Permissions

admin.site.register(Experiment)
admin.site.register(Progress)
admin.site.register(Permissions)
