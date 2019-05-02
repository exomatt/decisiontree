from rest_framework import permissions, viewsets

from .serializers import ExperimentSerializer


# Experiments Viewset

class ExperimentViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = ExperimentSerializer

    def get_queryset(self):
        return self.request.user.experiments.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


