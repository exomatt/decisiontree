from django.urls import path, include
from rest_framework import routers


from .api import ExperimentViewSet, ExperimentResult, ExperimentFiles, ExperimentTask, ExperimentProgress, \
    ExperimentShare, ExperimentCrud, FileDownloader, ExperimentCopy

router = routers.DefaultRouter()
router.register('api/experiment', ExperimentViewSet, 'experiment')

# urlpatterns = router.urls


urlpatterns = [
    path('', include(router.urls)),
    path('api/results', ExperimentResult.as_view()),
    path('api/files', ExperimentFiles.as_view()),
    path('api/task', ExperimentTask.as_view()),
    path('api/progress', ExperimentProgress.as_view()),
    path('api/share', ExperimentShare.as_view()),
    path('api/crud', ExperimentCrud.as_view()),
    path('api/copy', ExperimentCopy.as_view()),
    path('api/fileDownload', FileDownloader.as_view())
]
