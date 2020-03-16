from django.contrib import admin

# Register your models here.
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin

from decisionTreeCore.models import Experiment, Progress, Permissions

# admin.site.register(Experiment)
admin.site.register(Progress)
admin.site.register(Permissions)


class PermissionsInline(admin.TabularInline):
    model = Permissions


class ExperimentAdmin(admin.ModelAdmin):
    inlines = [
        PermissionsInline,
    ]


admin.site.register(Experiment, ExperimentAdmin)
