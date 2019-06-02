from django.conf import settings
from rest_framework import permissions, viewsets

from decisionTreeCore.task import gdt_run
from .serializers import ExperimentSerializer


# Experiments Viewset

class ExperimentViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = ExperimentSerializer

    def get_queryset(self):
        return self.request.user.experiment.all()

    def perform_create(self, serializer):
        experiment = serializer.save(user=self.request.user, status="Running")
        user = self.request.user
        username = user.username
        path = settings.BASE_USERS_DIR + username + "/" + experiment.config_file_name
        gdt_run.delay(path, experiment.id)
