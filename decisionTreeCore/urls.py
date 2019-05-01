from rest_framework import routers
from django.urls import include, path
from .api import ExperimentViewSet, RegisterAPI, LoginAPI
from knox import views as knox_views

router = routers.DefaultRouter()
router.register('api/experiment', ExperimentViewSet, 'experiment')

urlpatterns = [
    path('', include(router.urls)),
    path('api/auth/', include('knox.urls')),
    path('api/auth/register', RegisterAPI.as_view()),
    path('api/auth/login', LoginAPI.as_view())
]
