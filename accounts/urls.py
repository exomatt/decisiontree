from django.urls import path

from accounts.api import LoginAPI, RegisterAPI, UserAPI

urlpatterns = [
    path('api/auth/register', RegisterAPI.as_view()),
    path('api/auth/login', LoginAPI.as_view()),
    path('api/auth/user', UserAPI.as_view())
]
