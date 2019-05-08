from rest_framework import routers

from .api import ExperimentViewSet

router = routers.DefaultRouter()
router.register('api/experiment', ExperimentViewSet, 'experiment')

urlpatterns = router.urls
