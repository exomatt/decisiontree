from django.urls import path

from accounts.api import LoginAPI, RegisterAPI, UserAPI, LogoutAPI, UserFiles

urlpatterns = [
    path('api/auth/register', RegisterAPI.as_view()),
    path('api/auth/login', LoginAPI.as_view()),
    path('api/auth/user', UserAPI.as_view()),
    path('api/auth/logout', LogoutAPI.as_view()),
    path('api/auth/userFiles', UserFiles.as_view())
]
