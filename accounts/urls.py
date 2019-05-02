from django.urls import path

from accounts.api import LoginAPI, RegisterAPI

urlpatterns = [
    path('api/auth/register', RegisterAPI.as_view()),
    path('api/auth/login', LoginAPI.as_view())
]
