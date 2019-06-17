from django.urls import path, include
from rest_framework import routers

from .api import ExperimentViewSet, ExperimentResult, ExperimentFiles

router = routers.DefaultRouter()
router.register('api/experiment', ExperimentViewSet, 'experiment')

# urlpatterns = router.urls


urlpatterns = [
    path('', include(router.urls)),
    path('api/results', ExperimentResult.as_view()),
    path('api/files', ExperimentFiles.as_view())
]
