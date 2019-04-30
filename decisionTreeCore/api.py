from rest_framework import viewsets, permissions

from decisionTreeCore.models import Experiment
from .serializers import ExperimentSerializer


# Experiment Viewset

class ExperimentViewSet(viewsets.ModelViewSet):
    queryset = Experiment.objects.all()
    permission_classes = [
        permissions.AllowAny
    ]
    serializer_class = ExperimentSerializer
