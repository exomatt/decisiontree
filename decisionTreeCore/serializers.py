from rest_framework import serializers

from decisionTreeCore.models import Experiment


# Experiments Serializer
class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = '__all__'
